import Post from '../models/Post';
import User from '../models/User';
import File from '../models/File';

class PostLikeController {
  async store(req, res) {
    const { userId: user_id } = req;
    const { post_id } = req.params;

    const post = await Post.findByPk(post_id);

    if (!post) {
      throw new Error('Page does not exist');
    }

    const user = await User.findByPk(user_id);

    const isLiked = await post.hasLikes([user]);

    if (isLiked) {
      await post.removeLike(user);

      return res.json({ msg: 'like removed sucessufully' });
    } else {
      await post.addLike(user);

      return res.json({ msg: 'like added sucessufully' });
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
