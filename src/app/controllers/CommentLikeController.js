import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';
import File from '../models/File';

import { Op } from 'sequelize';

import SeeFriendshipStatus from '../services/SeeFriendshipStatus';

import Notification from '../schemas/Notification';

import Cache from '../../lib/Cache';

class CommentLikeController {
  async store(req, res) {
    try {
      const { userId: user_id, blocksIds, io, connectedUsers } = req;
      const { post_id, op_id, comment_id } = req.params;

      if (blocksIds.includes(op_id)) {
        throw new Error('Unavailable content');
      }

      const post = await Post.findByPk(post_id, {
        include: [
          {
            model: File,
            as: 'picture',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      if (!post) {
        throw new Error('Post does not exist');
      }

      const comment = await Comment.findByPk(comment_id);

      if (!comment) {
        throw new Error('Comment does not exist');
      }

      const user = await User.findByPk(user_id, {
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

      const isLiked = await comment.hasLikes([user]);

      const room = `post:${post_id}`;
      io.to(room).emit('LIKE_COMMENT', {
        params: {
          person: user,
          post_id: Number(post_id),
          comment_id: Number(comment_id),
          addedLike: !isLiked,
        },
      });

      if (isLiked) {
        await comment.removeLike(user);

        const usersThatHaveThisPostCached = await Cache.get(`post:${post.id}`);
        usersThatHaveThisPostCached.length > 0 &&
          (await Cache.invalidateManyPosts([
            ...usersThatHaveThisPostCached,
            user_id,
          ])); //remember to remove the userId

        return res.json({ msg: 'like removed sucessufully' });
      } else {
        await comment.addLike(user);

        if (user_id !== comment.user_id) {
          const notification = await Notification.create({
            context: 'like_comment',
            recepient: comment.user_id,
            content: {
              text: comment.content,
              post_id,
              post_picture: post.picture ? post.picture.url : null,
              comment_id,
              comment_picture: null,
            },
            dispatcher: {
              id: user_id,
              username: user.username,
              name: user.name ? user.name : null,
              avatar: user.avatar ? user.avatar.url : null,
            },
          });
          io.to(connectedUsers[op_id]).emit('NOTIFICATION', {
            params: {
              notification,
            },
          });
        }

        const usersThatHaveThisPostCached = await Cache.get(`post:${post.id}`);
        usersThatHaveThisPostCached &&
          usersThatHaveThisPostCached.length > 0 &&
          (await Cache.invalidateManyPosts([
            ...usersThatHaveThisPostCached,
            user_id,
          ])); //remember to remove the userId

        return res.json({ msg: 'like added sucessufully' });
      }
    } catch (err) {
      console.log(err);
    }
  }
  async index(req, res) {
    const { userId, blocksIds } = req;
    const { post_id, comment_id } = req.params;

    const post = await Post.findByPk(post_id);

    if (!post) {
      throw new Error('Post does not exist');
    }

    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      throw new Error('Comment does not exist');
    }

    const likers = await comment.getLikes({
      order: [['created_at', 'DESC']],
      where: {
        id: {
          [Op.notIn]: blocksIds,
        },
      },
      limit: 50,
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
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    const likersIds = likers.map(liker => liker.dataValues.id);

    const friendships = await SeeFriendshipStatus.run({
      user_id: userId,
      friendsIds: likersIds,
    });

    likers.map(liker => {
      if (liker.id === userId) {
        liker.dataValues.status = null;
      } else if (friendships.friendsIds.includes(liker.id)) {
        liker.dataValues.status = 'friends';
      } else if (friendships.sentIds.includes(liker.id)) {
        liker.dataValues.status = 'sent';
      } else if (friendships.receivedIds.includes(liker.id)) {
        liker.dataValues.status = 'received';
      } else {
        liker.dataValues.status = 'add';
      }
      return liker;
    });

    return res.json(likers);
  }
}

export default new CommentLikeController();
