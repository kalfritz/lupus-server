import Post from '../models/Post';
import File from '../models/File';
import User from '../models/User';
import { Op } from 'sequelize';

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
    const { friendsIds } = req;

    const posts = await Post.findAll({
      where: {
        user_id: {
          [Op.in]: friendsIds,
        },
      },
      include: [
        {
          model: File,
          as: 'picture',
          attributes: ['id', 'path', 'url'],
        },
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
      ],
    });

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
  async delete(req, res) {
    const { userId } = req;
    const { post_id } = req.params;

    const post = await Post.findByPk(post_id);

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.user_id !== userId) {
      throw new Error('You do not have permission to delete this post');
    }

    const deletedPost = await post.destroy();

    return res.json(deletedPost);
  }
}

export default new PostController();
