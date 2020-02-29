import Post from '../models/Post';
import User from '../models/User';
import File from '../models/File';
import { Op } from 'sequelize';

import SeeFriendshipStatus from '../services/SeeFriendshipStatus';

import Notification from '../schemas/Notification';

import Cache from '../../lib/Cache';

class PostLikeController {
  async store(req, res) {
    const { userId: user_id, friendsIds } = req;
    const { post_id } = req.params;

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
      throw new Error('Page does not exist');
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

    const isLiked = await post.hasLikes([user]);

    if (isLiked) {
      await post.removeLike(user);

      const usersThatHaveThisPostCached = await Cache.get(`post:${post.id}`);
      usersThatHaveThisPostCached.length > 0 &&
        (await Cache.invalidateManyPosts([
          ...usersThatHaveThisPostCached,
          user_id,
        ])); //remember to remove the userId

      return res.json({ added: false, removed: true });
    } else {
      await post.addLike(user);

      if (user_id !== post.user_id) {
        await Notification.create({
          context: 'like_post',
          recepient: post.user_id,
          content: {
            text: post.content,
            post_id,
            post_picture: post.picture ? post.picture.url : null,
          },
          dispatcher: {
            id: user_id,
            username: user.username,
            name: user.name ? user.name : null,
            avatar: user.avatar ? user.avatar.url : null,
          },
        });
      }

      const usersThatHaveThisPostCached = await Cache.get(`post:${post.id}`);
      usersThatHaveThisPostCached.length > 0 &&
        (await Cache.invalidateManyPosts([
          ...usersThatHaveThisPostCached,
          user_id,
        ])); //remember to remove the userId

      return res.json({ added: true, removed: false });
    }
  }
  async index(req, res) {
    const { userId, blocksIds } = req;
    const { post_id } = req.params;

    const post = await Post.findByPk(post_id);

    let likers = await post.getLikes({
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

export default new PostLikeController();
