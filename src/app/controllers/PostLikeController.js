import Post from '../models/Post';
import User from '../models/User';
import File from '../models/File';

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
    const { post_id } = req.params;

    const post = await Post.findByPk(post_id);

    const likes = await post.getLikes({
      attributes: ['id', 'name', 'username'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(likes);
  }
}

export default new PostLikeController();
