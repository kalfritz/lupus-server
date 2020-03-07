import User from '../models/User';
import File from '../models/File';
import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';
import SeeFriendshipStatus from '../services/SeeFriendshipStatus';

class FriendController {
  async index(req, res) {
    try {
      let { user_id } = req.params;
      const { limit = 50 } = req.query;
      const { userId, friendsIds: visitorFriendsIds, blocksIds } = req;

      user_id = Number(user_id);

      const {
        count,
        rows: friendshipsOfUserBeingFetched,
      } = await UserRelationship.findAndCountAll({
        where: {
          status: 'friends',
          [Op.or]: [
            {
              user_first_id: user_id,
              user_second_id: {
                [Op.notIn]: blocksIds,
              },
            },
            {
              user_first_id: {
                [Op.notIn]: blocksIds,
              },
              user_second_id: user_id,
            },
          ],
        },
        limit,
      });

      let friendsIds = [];

      friendsIds = friendshipsOfUserBeingFetched.map(friendship => {
        if (friendship.user_first_id === user_id) {
          return friendship.user_second_id;
        } else if (friendship.user_second_id === user_id) {
          return friendship.user_first_id;
        }
      });

      const friendships = await SeeFriendshipStatus.run({
        user_id: userId,
        friendsIds,
      });

      let friends = await User.findAll({
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

      friends = friends.map(friend => {
        friend.dataValues.mutualFriend = visitorFriendsIds.includes(friend.id)
          ? true
          : false;

        if (friend.id === userId) {
          friend.dataValues.status = null;
        } else if (friendships.friendsIds.includes(friend.id)) {
          friend.dataValues.status = 'friends';
        } else if (friendships.sentIds.includes(friend.id)) {
          friend.dataValues.status = 'sent';
        } else if (friendships.receivedIds.includes(friend.id)) {
          friend.dataValues.status = 'received';
        } else {
          friend.dataValues.status = 'add';
        }

        return friend;
      });

      return res.json({ friends, count });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new FriendController();
