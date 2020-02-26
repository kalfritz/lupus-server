import UserRelationship from '../models/UserRelationship';
import User from '../models/User';
import { Op } from 'sequelize';

class MutualFriendController {
  async show(req, res) {
    try {
      let { userId, friendsIds: visitorFriendsIds } = req;
      let { person_id } = req.params;

      userId = Number(userId);
      person_id = Number(person_id);

      if (userId === person_id) {
        throw new Error('You cannot be your own friend.');
      }

      const mutualFriends = await UserRelationship.findAll({
        where: {
          status: 'friends',
          [Op.or]: [
            {
              user_first_id: person_id,
              user_second_id: {
                [Op.in]: visitorFriendsIds,
              },
            },
            {
              user_first_id: {
                [Op.in]: visitorFriendsIds,
              },
              user_second_id: person_id,
            },
          ],
        },
      });

      const mutualFriendsIds = mutualFriends.map(friend => {
        return friend.user_first_id === person_id
          ? friend.user_second_id
          : friend.user_first_id;
      });

      const friends = await User.findAll({
        where: {
          id: {
            [Op.in]: mutualFriendsIds,
          },
        },
        attributes: ['id', 'name', 'username'],
      });

      return res.json(friends);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new MutualFriendController();
