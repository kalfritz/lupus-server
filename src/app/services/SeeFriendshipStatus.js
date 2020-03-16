import { Op } from 'sequelize';
import UserRelationship from '../models/UserRelationship';

class SeeFriendshipStatus {
  async run({ user_id, friendsIds }) {
    const [friendships_first, friendships_second] = await Promise.all([
      UserRelationship.findAll({
        where: {
          status: {
            [Op.notIn]: [
              'block_first_second',
              'block_second_first',
              'block_both',
            ],
          },
          user_first_id: user_id,
          user_second_id: {
            [Op.in]: friendsIds,
          },
        },
      }),
      UserRelationship.findAll({
        where: {
          status: {
            [Op.notIn]: [
              'block_first_second',
              'block_second_first',
              'block_both',
            ],
          },
          user_first_id: {
            [Op.in]: friendsIds,
          },
          user_second_id: user_id,
        },
      }),
    ]);

    if (friendships_first.length > 0) {
      friendships_first.map(friendship => {
        if (friendship.status === 'friends') {
          friendship.dataValues.customStatus = 'friends';
        }
        if (friendship.status === 'pending_first_second') {
          friendship.dataValues.customStatus = 'sent';
        }
        if (friendship.status === 'pending_second_first') {
          friendship.dataValues.customStatus = 'received';
        }

        friendship.dataValues.friend_id = friendship.user_second_id;

        return friendship;
      });
    }
    if (friendships_second.length > 0) {
      friendships_second.map(friendship => {
        if (friendship.status === 'friends') {
          friendship.dataValues.customStatus = 'friends';
        }
        if (friendship.status === 'pending_first_second') {
          friendship.dataValues.customStatus = 'received';
        }
        if (friendship.status === 'pending_second_first') {
          friendship.dataValues.customStatus = 'sent';
        }

        friendship.dataValues.friend_id = friendship.user_first_id;

        return friendship;
      });
    }

    let friendships = [...friendships_first, ...friendships_second];

    let friends = friendships.filter(
      friendship => friendship.dataValues.customStatus === 'friends'
    );

    let sent = friendships.filter(
      friendship => friendship.dataValues.customStatus === 'sent'
    );

    let received = friendships.filter(
      friendship => friendship.dataValues.customStatus === 'received'
    );

    return {
      friendsIds: friends.map(friendship => friendship.dataValues.friend_id),
      sentIds: sent.map(friendship => friendship.dataValues.friend_id),
      receivedIds: received.map(friendship => friendship.dataValues.friend_id),
    };
  }
}

export default new SeeFriendshipStatus();
