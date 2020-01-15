import User from '../models/User';
import File from '../models/File';
import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';

class FriendController {
  async index(req, res) {
    const { user_id } = req.params;

    const [friendships_first, friendships_second] = await Promise.all([
      UserRelationship.findAll({
        where: {
          status: 'friends',
          user_second_id: user_id,
        },
      }),
      UserRelationship.findAll({
        where: {
          status: 'friends',
          user_first_id: user_id,
        },
      }),
    ]);

    let friendsIds = [];

    if (friendships_first.length > 0) {
      friendships_first.forEach(friendship =>
        friendsIds.push(Number(friendship.user_first_id))
      );
    }
    if (friendships_second.length > 0) {
      friendships_second.forEach(friendship =>
        friendsIds.push(Number(friendship.user_second_id))
      );
    }
    const friends = await User.findAll({
      where: {
        id: {
          [Op.in]: friendsIds,
        },
      },
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'path', 'url'],
      },
    });

    return res.json(friends);
  }
}

export default new FriendController();
