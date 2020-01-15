import User from '../models/User';
import File from '../models/File';
import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';

class ReceivedFriendRequestController {
  async index(req, res) {
    const { userId } = req;

    const [received_first, received_second] = await Promise.all([
      UserRelationship.findAll({
        where: {
          status: 'pending_first_second',
          user_second_id: userId,
        },
      }),
      UserRelationship.findAll({
        where: {
          status: 'pending_second_first',
          user_first_id: userId,
        },
      }),
    ]);

    let requestersIds = [];

    if (received_first.length > 0) {
      received_first.forEach(friendship =>
        requestersIds.push(Number(friendship.user_first_id))
      );
    }
    if (received_second.length > 0) {
      received_second.forEach(friendship =>
        requestersIds.push(Number(friendship.user_second_id))
      );
    }

    let requesters;

    if (requestersIds.length > 0) {
      requesters = await User.findAll({
        where: {
          id: {
            [Op.in]: requestersIds,
          },
        },
        include: {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      });

      return res.json(requesters);
    } else {
      return res.json([]);
    }
  }
}

export default new ReceivedFriendRequestController();
