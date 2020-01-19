import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import File from '../models/File';

import Notification from '../schemas/Notification';

import { Op } from 'sequelize';

class CommentController {
  async store(req, res) {
    const { content } = req.body;
    const { userId } = req;
    const { post_id } = req.params;

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
      ],
    });
    if (userId !== post.user_id) {
      await Notification.create({
        content: `${user.name} commented on your post ${post.content}`,
        picture: post.picture ? post.picture.url : null,
        user: post.user_id,
        user_avatar: user.avatar ? user.avatar.url : null,
      });
    }

    return res.json(comment);
  }
  async index(req, res) {
    const { blocksIds } = req;
    const { post_id } = req.params;
    const comments = await Comment.findAll({
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
          attributes: ['id', 'name', 'username'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: User,
          as: 'likes',
          attributes: ['id', 'name', 'username', 'email'],
          /*where: {
            /*I found that I dont need to do that as
            the where clause over there in the top already take care
            of do not returning the blocked users that liked. 
            In fact for some reason adding this where clause does 
            break the query.
            id: {
              [Op.notIn]: blocksIds,
            },
          },*/
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
      ],
    });

    return res.json(comments);
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

    return res.json(deletedComment);
  }
}

export default new CommentController();
