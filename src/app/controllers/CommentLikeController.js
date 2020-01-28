import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';
import File from '../models/File';

import Notification from '../schemas/Notification';

import Cache from '../../lib/Cache';

class CommentLikeController {
  async store(req, res) {
    const { userId: user_id, friendsIds } = req;
    const { post_id, comment_id } = req.params;
    console.log('friends ids:', friendsIds);

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
      ],
    });

    const isLiked = await comment.hasLikes([user]);

    if (isLiked) {
      await comment.removeLike(user);

      return res.json({ msg: 'like removed sucessufully' });
    } else {
      await comment.addLike(user);

      if (user_id !== comment.user_id) {
        await Notification.create({
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
      }

      const usersThatHaveThisPostCached = await Cache.get(`post:${post.id}`);
      usersThatHaveThisPostCached.length > 0 &&
        (await Cache.invalidateManyPosts([
          ...usersThatHaveThisPostCached,
          user_id,
        ])); //remember to remove the userId

      return res.json({ msg: 'like added sucessufully' });
    }
  }
  async index(req, res) {
    const { post_id, comment_id } = req.params;

    const post = await Post.findByPk(post_id);

    if (!post) {
      throw new Error('Post does not exist');
    }

    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      throw new Error('Comment does not exist');
    }

    const likes = await comment.getLikes({
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

export default new CommentLikeController();
