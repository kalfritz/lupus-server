import User from '../models/User';
import File from '../models/File';
import { Op } from 'sequelize';

class MyFriendList {
  async index(req, res) {
    try {
      const { friendsIds, connectedUsers } = req;

      const friends = await User.findAll({
        where: {
          id: {
            [Op.in]: friendsIds,
          },
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
      });

      const friendsWithOnlineInfo = friends.map(friend => {
        let online = connectedUsers && Boolean(connectedUsers[friend.id]);
        friend.dataValues.online = online;
        return friend;
      });

      return res.json(friendsWithOnlineInfo);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new MyFriendList();
