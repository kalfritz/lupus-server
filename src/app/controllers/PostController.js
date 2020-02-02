import Post from '../models/Post';
import Comment from '../models/Comment';
import File from '../models/File';
import User from '../models/User';
import sequelize, { Op } from 'sequelize';
import Cache from '../../lib/Cache';

class PostController {
  async store(req, res) {
    const { content } = req.body;
    const { userId, friendsIds } = req;

    const post = await Post.create({
      user_id: userId,
      content,
    });

    await Cache.invalidateManyPosts([...friendsIds, userId]); //remember to remove the userId

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
          attributes: ['id', 'user_id', 'content', 'created_at', 'updated_at'],
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
    const { userId, friendsIds, blocksIds } = req;
    const { page = 1 } = req.query;
    console.log('fi:', friendsIds);

    const cacheKey = `user:${userId}:posts:${page}`;
    const cached = await Cache.get(cacheKey);
    if (cached) {
      console.log('it will return cached');
      return res.json(cached);
    }

    console.log('querying..');
    const posts = await Post.findAll({
      where: {
        user_id: {
          [Op.in]: [...friendsIds, userId], //Remember to remove the user id later.
          [Op.notIn]: blocksIds,
        },
      },
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
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
          attributes: [
            'id',
            'user_id',
            'post_id',
            'content',
            'created_at',
            'updated_at',
          ],
          order: [['created_at', 'DESC']],
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
            {
              model: User,
              as: 'likes',
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

    posts.forEach(async post => {
      const usersThatHaveThisPostCached = await Cache.get(`post:${post.id}`);
      usersThatHaveThisPostCached && usersThatHaveThisPostCached.length > 0
        ? await Cache.set(`post:${post.id}`, [
            ...usersThatHaveThisPostCached,
            userId,
          ])
        : await Cache.set(`post:${post.id}`, [userId]);
    });

    await Cache.set(cacheKey, posts); //user cache

    return res.json(posts);
  }
  async update(req, res) {
    const { userId, friendsIds } = req;
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

    await Cache.invalidateManyPosts([...friendsIds, userId]);

    return res.json(updatedPost);
  }
  async delete(req, res) {
    const { userId, friendsIds } = req;
    const { post_id } = req.params;

    const post = await Post.findByPk(post_id);

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.user_id !== userId) {
      throw new Error('You do not have permission to delete this post');
    }

    const deletedPost = await post.destroy();

    await Cache.invalidateManyPosts([...friendsIds, userId]);

    return res.json(deletedPost);
  }
}

export default new PostController();
