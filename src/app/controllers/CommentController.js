import { formatDistance, format } from 'date-fns';
import en from 'date-fns/locale/en-US';

import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import File from '../models/File';

import Notification from '../schemas/Notification';

import { Op } from 'sequelize';

import Cache from '../../lib/Cache';

class CommentController {
  async store(req, res) {
    const { content } = req.body;
    const { userId, blocksIds, io, connectedUsers } = req;
    const { post_id, op_id } = req.params;

    if (blocksIds.includes(op_id)) {
      throw new Error('Unavailable content');
    }

    const comment = await Comment.create({
      user_id: userId,
      post_id,
      content,
    });

    const post = await Post.findOne({
      where: {
        id: post_id,
      },
      include: [
        { model: File, as: 'picture', attributes: ['id', 'path', 'url'] },
      ],
    });
    const user = await User.findByPk(userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: File,
          as: 'cover',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    comment.dataValues.user = user;
    comment.dataValues.likes = [];
    comment.dataValues.timeDistance = formatDistance(
      comment.dataValues.createdAt,
      new Date(),
      {
        locale: en,
      }
    );
    comment.dataValues.time = format(
      comment.dataValues.createdAt,
      "mm'/'dd'/'yy ',' h':'mm a",
      {
        locale: en,
      }
    );
    comment.dataValues.liked = false;
    comment.dataValues.editable = comment.user_id === userId;

    const room = `post:${post_id}`;
    io.to(room).emit('COMMENT_POST', {
      params: {
        person: user,
        post_id: Number(post_id),
        comment,
      },
    });

    if (userId !== post.user_id) {
      const notification = await Notification.create({
        context: 'comment_post',
        recepient: post.user_id,
        content: {
          text: post.content,
          post_id,
          post_picture: post.picture ? post.picture.url : null,
          comment_id: comment.id,
        },
        dispatcher: {
          id: userId,
          username: user.username,
          name: user.name ? user.name : null,
          avatar: user.avatar ? user.avatar.url : null,
        },
      });
      console.log(connectedUsers[op_id]);
      io.to(connectedUsers[op_id]).emit('NOTIFICATION', {
        params: {
          notification,
        },
      });
    }

    const usersThatHaveThisPostCached = await Cache.get(`post:${post.id}`);

    usersThatHaveThisPostCached && usersThatHaveThisPostCached.length > 0
      ? await Cache.invalidateManyPosts([
          ...usersThatHaveThisPostCached,
          userId,
        ])
      : null; //remember to remove the userId

    return res.json(comment);
  }
  async index(req, res) {
    try {
      const { userId, blocksIds } = req;
      const { post_id } = req.params;

      console.log('querying..............');

      let comments = await Comment.findAll({
        where: {
          post_id,
          user_id: {
            [Op.notIn]: blocksIds,
          },
        },
        order: [['created_at', 'ASC']],
        limit: 50,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'username', 'bio', 'location'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
              {
                model: File,
                as: 'cover',
                attributes: ['id', 'url', 'path'],
              },
            ],
          },
          {
            model: User,
            as: 'likes',
            attributes: ['id', 'name', 'username', 'email', 'bio', 'location'],
            order: [['created_at', 'ASC']],
            where: {
              id: {
                [Op.notIn]: blocksIds,
              },
            },
            required: false,
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['id', 'url', 'path'],
              },
              {
                model: File,
                as: 'cover',
                attributes: ['id', 'url', 'path'],
              },
            ],
          },
        ],
      });
      comments = comments.map(comment => {
        comment.dataValues.timeDistance = formatDistance(
          comment.dataValues.createdAt,
          new Date(),
          {
            locale: en,
          }
        );
        comment.dataValues.time = format(
          comment.dataValues.createdAt,
          "mm'/'dd'/'yy ',' h':'mm a",
          {
            locale: en,
          }
        );
        comment.dataValues.liked = comment.likes.some(
          like => like.id === userId
        );
        return comment;
      });
      return res.json(comments);
    } catch (err) {
      console.log(err);
    }
  }
  async update(req, res) {
    const { userId } = req;
    const { comment_id } = req.params;

    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new Error('You do not have permission to edit this comment');
    }

    const updatedComment = await comment.update(req.body, {
      new: true,
    });

    const usersThatHaveThisPostCached = await Cache.get(
      `post:${comment.post_id}`
    );
    usersThatHaveThisPostCached.length > 0 &&
      (await Cache.invalidateManyPosts([
        ...usersThatHaveThisPostCached,
        userId,
      ])); //remember to remove the userId

    return res.json(updatedComment);
  }
  async delete(req, res) {
    const { userId } = req;
    const { comment_id } = req.params;

    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new Error('You do not have permission to delete this comment');
    }

    const deletedComment = await comment.destroy();

    const usersThatHaveThisPostCached = await Cache.get(
      `post:${comment.post_id}`
    );
    usersThatHaveThisPostCached.length > 0 &&
      (await Cache.invalidateManyPosts([
        ...usersThatHaveThisPostCached,
        userId,
      ])); //remember to remove the userId

    return res.json(deletedComment);
  }
}

export default new CommentController();
