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
          limit: 3,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'username', 'email'],
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

    res.json(posts);
  }
}

export default new TimelineController();
