import { parseISO, formatDistance, format } from 'date-fns';
import en from 'date-fns/locale/en-US';

import Post from '../models/Post';
import Comment from '../models/Comment';
import File from '../models/File';
import User from '../models/User';
import { Op } from 'sequelize';
import Cache from '../../lib/Cache';
import IoRedis from '../../lib/IoRedis';

class PostController {
  async store(req, res) {
    const { content, picture_id } = req.body;
    const { userId, friendsIds, socket } = req;

    if (content === '') throw new Error('Content cannot be blank');

    const post = await Post.create({
      user_id: userId,
      content,
      picture_id,
    });

    await Cache.invalidateManyPosts([...friendsIds, userId]); //remember to remove the userId

    const newPost = await Post.findOne({
      where: {
        id: post.id,
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
            {
              model: File,
              as: 'cover',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    newPost.dataValues.likes = [];
    newPost.dataValues.comments = [];

    socket.join(`post:${newPost.id}`);

    return res.json(newPost);
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
          attributes: ['id', 'name', 'username', 'bio', 'location'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
            {
              model: File,
              as: 'cover',
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
              attributes: [
                'id',
                'name',
                'username',
                'email',
                'bio',
                'location',
              ],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'url', 'path'],
                },
                {
                  model: File,
                  as: 'cover',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            },
            {
              model: User,
              as: 'likes',
              order: [['created_at', 'DESC']],
              attributes: [
                'id',
                'name',
                'username',
                'email',
                'bio',
                'location',
              ],
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
                {
                  model: File,
                  as: 'cover',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'likes',
          order: [['created_at', 'DESC']],
          attributes: ['id', 'name', 'username', 'email', 'bio', 'location'],
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
            {
              model: File,
              as: 'cover',
              attributes: ['id', 'path', 'url'],
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
    try {
      const { userId, friendsIds, blocksIds, socket } = req;
      const { page = 1 } = req.query;

      const cacheKey = `user:${userId}:posts:${page}`;
      const cached = await Cache.get(cacheKey);

      if (cached) {
        console.log('it will return cached');
        cached.map(post => {
          socket.join(`post:${post.id}`);

          post.comments.map(comment => {
            comment.timeDistance = formatDistance(
              parseISO(comment.created_at),
              new Date(),
              {
                locale: en,
              }
            );
            return comment;
          });
          return post;
        });

        return res.json(cached);
      }

      console.log('querying..');
      let posts = await Post.findAll({
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
            attributes: ['id', 'name', 'username', 'bio', 'location'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['id', 'path', 'url'],
              },
              {
                model: File,
                as: 'cover',
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
                attributes: [
                  'id',
                  'name',
                  'username',
                  'email',
                  'bio',
                  'location',
                ],
                include: [
                  {
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'url', 'path'],
                  },
                  {
                    model: File,
                    as: 'cover',
                    attributes: ['id', 'path', 'url'],
                  },
                ],
              },
              {
                model: User,
                as: 'likes',
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
                  {
                    model: File,
                    as: 'cover',
                    attributes: ['id', 'path', 'url'],
                  },
                ],
              },
            ],
          },
          {
            model: User,
            as: 'likes',
            /*limit: 19,*/
            order: [['created_at', 'DESC']],
            required: false,
            where: {
              id: {
                [Op.notIn]: blocksIds,
              },
            },
            attributes: ['id', 'name', 'username'],
          },
        ],
      });

      const postsIds = posts.map(post => post.id);
      console.log(postsIds);
      await IoRedis.set(`user:${userId}:posts`, postsIds);

      posts = posts.map(post => {
        socket.join(`post:${post.id}`);

        post.comments = post.comments.reverse().map(comment => {
          comment.dataValues.timeDistance = formatDistance(
            comment.dataValues.created_at,
            new Date(),
            {
              locale: en,
            }
          );
          comment.dataValues.time = format(
            comment.dataValues.created_at,
            "mm'/'dd'/'yy ',' h':'mm a",
            {
              locale: en,
            }
          );
          comment.dataValues.liked = comment.likes.some(
            like => like.id === userId
          );
          return comment;
        });

        post.dataValues.timeDistance = formatDistance(
          post.dataValues.createdAt,
          new Date(),
          {
            locale: en,
          }
        );
        post.dataValues.time = format(
          post.dataValues.createdAt,
          "mm'/'dd'/'yy ',' h':'mm a",
          {
            locale: en,
          }
        );
        post.dataValues.liked = post.likes.some(like => like.id === userId);
        post.dataValues.editable = post.user.id === userId;

        return post;
      });

      await Cache.set(cacheKey, posts); //user cache

      return res.json(posts);
    } catch (err) {
      console.log(err);
    }
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
