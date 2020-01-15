import User from '../models/User';
import File from '../models/File';
import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';

class SentFriendRequestController {
  async index(req, res) {
    const { userId } = req;

    const [sent_first, sent_second] = await Promise.all([
      UserRelationship.findAll({
        where: {
          status: 'pending_first_second',
          user_first_id: userId,
        },
      }),
      UserRelationship.findAll({
        where: {
          status: 'pending_second_first',
          user_second_id: userId,
        },
      }),
    ]);

    let sentIds = [];

    if (sent_first.length > 0) {
      sent_first.forEach(friendship =>
        sentIds.push(Number(friendship.user_second_id))
      );
    }
    if (sent_second.length > 0) {
      sent_second.forEach(friendship =>
        sentIds.push(Number(friendship.user_first_id))
      );
    }

    let requesteds;

    if (sentIds.length > 0) {
      requesteds = await User.findAll({
        where: {
          id: {
            [Op.in]: sentIds,
          },
        },
        include: {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      });

      return res.json(requesteds);
    } else {
      return res.json([]);
    }
  }
}

export default new SentFriendRequestController();
