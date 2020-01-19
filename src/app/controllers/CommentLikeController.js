import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';
import File from '../models/File';

import Notification from '../schemas/Notification';

class PostLikeController {
  async store(req, res) {
    const { userId: user_id } = req;
    const { post_id, comment_id } = req.params;

    const post = await Post.findByPk(post_id);

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
          content: `${user.name} liked your comment ${comment.content}`,
          picture: comment.picture ? comment.picture.url : null, // it will results always in null as I have no picture in any comment for now
          user: comment.user_id,
          user_avatar: user.avatar ? user.avatar.url : null,
        });
      }

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

export default new PostLikeController();
