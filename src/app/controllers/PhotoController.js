import Post from '../models/Post';
import File from '../models/File';
import User from '../models/User';
import { Op } from 'sequelize';

class PhotoController {
  async index(req, res) {
    let { blocksIds } = req;
    const { person_id } = req.params;
    const { limit = 50, page = 1 } = req.query;

    blocksIds = blocksIds || [];

    if (blocksIds.includes(person_id)) {
      throw new Error('Unavailable content');
    }

    const posts = await Post.findAll({
      where: {
        user_id: person_id,
      },
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: File,
          as: 'picture',
          attributes: ['id', 'path', 'url'],
          required: true,
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
          model: User,
          as: 'likes',
          where: {
            id: {
              [Op.notIn]: blocksIds,
            },
          },
          required: false,
          order: ['created_at', 'DESC'],
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

export default new PhotoController();
