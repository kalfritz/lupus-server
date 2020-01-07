/*import User from '../models/User';
import Post from '../models/Post';*/
import Comment from '../models/Comment';

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
    return res.json(comment);
  }
  async index(req, res) {
    const comments = await Comment.findAll();

    res.json(comments);
  }
}

export default new CommentController();
