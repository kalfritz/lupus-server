import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';

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

    const user = await User.findByPk(user_id);

    const isLiked = await comment.hasLikes([user]);

    if (isLiked) {
      await comment.removeLike(user);

      return res.json({ msg: 'like removed sucessufully' });
    } else {
      await comment.addLike(user);

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
    });

    return res.json(likes);
  }
}

export default new PostLikeController();
