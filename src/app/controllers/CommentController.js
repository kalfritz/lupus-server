import Comment from '../models/Comment';
import User from '../models/User';
import File from '../models/File';
import { Op } from 'sequelize';

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
    const { blocksIds } = req;
    const { post_id } = req.params;
    const comments = await Comment.findAll({
      where: {
        post_id,
        user_id: {
          [Op.notIn]: blocksIds,
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'username'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: User,
          as: 'likes',
          attributes: ['id', 'name', 'username', 'email'],

          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
      ],
    });

    res.json(comments);
  }
  async update(req, res) {
    const { userId } = req;
    const { comment_id } = req.params;

    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new Error('You do not have permission to edit this comment');
    }

    const updatedComment = await comment.update(req.body, {
      new: true,
    });

    return res.json(updatedComment);
  }
  async delete(req, res) {
    const { userId } = req;
    const { comment_id } = req.params;

    const comment = await Comment.findByPk(comment_id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new Error('You do not have permission to delete this comment');
    }

    const deletedComment = await comment.destroy();

    return res.json(deletedComment);
  }
}

export default new CommentController();
