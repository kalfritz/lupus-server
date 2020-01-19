import Post from '../models/Post';
import Comment from '../models/Comment';
import File from '../models/File';
import User from '../models/User';
import sequelize, { Op } from 'sequelize';

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
  async show(req, res) {
    let { blocksIds } = req;
    const { post_id } = req.params;

    const post = await Post.findOne({
      where: {
        id: post_id,
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
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'user_id', 'content'],
          order: [['created_at', 'ASC']],
          required: false,
          where: {
            user_id: {
              [Op.notIn]: blocksIds,
            },
          },
          limit: 50,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'username', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'url', 'path'],
                },
              ],
            },
            {
              model: User,
              as: 'likes',
              order: [['created_at', 'DESC']],
              attributes: ['id', 'name', 'username', 'email'],
              required: false,
              where: {
                id: {
                  [Op.notIn]: blocksIds,
                },
              },
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'url', 'path'],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'likes',
          order: [['created_at', 'DESC']],
          attributes: ['id', 'name', 'username', 'email'],
          required: false,
          where: {
            id: {
              [Op.not]: blocksIds,
            },
          },
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

    if (blocksIds.includes(post.user_id)) {
      throw new Error('Post not found');
    }

    return res.json(post);
  }
  async index(req, res) {
    const { friendsIds, blocksIds } = req;

    const posts = await Post.findAll({
      where: {
        user_id: {
          [Op.in]: friendsIds,
          [Op.notIn]: blocksIds,
        },
      },
      order: [['created_at', 'DESC']],
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
        {
          model: Comment,
          as: 'comments',
          attributes: ['id', 'user_id', 'content'],
          order: [['created_at', 'ASC']],
          required: false,
          where: {
            user_id: {
              [Op.notIn]: blocksIds,
            },
          },
          limit: 3,
          include: [
            {
              model: User,
              as: 'user',
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
        },
        {
          model: User,
          as: 'likes',
          order: [['created_at', 'DESC']],
          required: false,
          where: {
            id: {
              [Op.notIn]: blocksIds,
            },
          },
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

    return res.json(posts);
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
