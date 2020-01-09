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
}

export default new PostController();
