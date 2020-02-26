import Post from '../models/Post';
import Comment from '../models/Comment';
import File from '../models/File';
import User from '../models/User';
import { Op } from 'sequelize';

class TimelineController {
  async index(req, res) {
    let { blocksIds } = req;
    const { person_id } = req.params;

    blocksIds = blocksIds || [];

    if (blocksIds.includes(person_id)) {
      throw new Error('You cannot access this page');
    }

    const posts = await Post.findAll({
      where: {
        user_id: person_id,
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
          where: {
            user_id: { [Op.notIn]: blocksIds },
          },
          required: false,
          order: [['created_at', 'ASC']],
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
            {
              model: User,
              as: 'likes',
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
          where: {
            id: {
              [Op.notIn]: blocksIds,
            },
          },
          required: false,
          order: ['created_at', 'DESC'],
          attributes: ['id', 'name', 'username', 'email', 'bio', 'location'],
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

    res.json(posts);
  }
}

export default new TimelineController();
