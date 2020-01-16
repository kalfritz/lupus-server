import Post from '../models/Post';
import File from '../models/File';
import User from '../models/User';

class TimelineController {
  async index(req, res) {
    const { person_id } = req.params;

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

    res.json(posts);
  }
}

export default new TimelineController();
