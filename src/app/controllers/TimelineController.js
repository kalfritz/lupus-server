import { formatDistance, format } from 'date-fns';
import en from 'date-fns/locale/en-US';

import Post from '../models/Post';
import Comment from '../models/Comment';
import File from '../models/File';
import User from '../models/User';
import { Op } from 'sequelize';

class TimelineController {
  async index(req, res) {
    try {
      let { userId, blocksIds, socket } = req;
      const { person_id } = req.params;
      const { page = 1 } = req.query;

      blocksIds = blocksIds || [];

      if (blocksIds.includes(person_id)) {
        throw new Error('You cannot access this page');
      }

      let posts = await Post.findAll({
        where: {
          user_id: person_id,
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
              user_id: { [Op.notIn]: blocksIds },
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
                  // 'avatar_id',
                  // 'cover_id',
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
                  id: { [Op.notIn]: blocksIds },
                },
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
          },
          {
            model: User,
            as: 'likes',
            attributes: [
              'id',
              'name',
              'username',
              'email',
              'bio',
              'location',
              'created_at',
            ],
            where: {
              id: {
                [Op.notIn]: blocksIds,
              },
            },
            required: false,
            order: [['created_at', 'DESC']],
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

      posts = posts.map(post => {
        socket.join(`post:${post.id}`);

        post.comments.map(comment => {
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
        post.dataValues.editable = Number(person_id) === userId;
        return post;
      });

      res.json(posts);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new TimelineController();
