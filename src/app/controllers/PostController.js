import User from '../models/User';
import Post from '../models/Post';

class PostController {
  async store(req, res) {
    const { content } = req.body;
    const { userId } = req;

    const post = await Post.create({
      user_id: userId,
      content,
    });

    return res.json(post);
  }
  async index(req, res) {
    const posts = await Post.findAll();

    res.json(posts);
  }
  async update(req, res) {
    const { userId } = req;
    const { post_id } = req.params;

    const post = await Post.findByPk(post_id);

    if (!post) {
      throw new Error('Post does not exist');
    }

    if (post.user_id !== userId) {
      throw new Error('You do not have permission to edit this post');
    }

    const updatedPost = await post.update(req.body, {
      new: true,
    });

    return res.json(updatedPost);
  }
}

export default new PostController();
