import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';

export default async (req, res, next) => {
  const { userId: user_id } = req;

  try {
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
          user_second_id: user_id,
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
          user_first_id: user_id,
        },
      }),
    ]);

    let friendsIds = [];

    if (friendships_first.length > 0) {
      friendships_first.map(friendship => {
        if (friendship.status === 'friends') {
          friendsIds.push(Number(friendship.user_first_id));
          friendship.dataValues.customStatus = 'friends';
        }
        if (friendship.status === 'pending_first_second') {
          friendship.dataValues.customStatus = 'received';
        }
        if (friendship.status === 'pending_second_first') {
          friendship.dataValues.customStatus = 'sent';
        }

        return friendship;
      });
    }
    if (friendships_second.length > 0) {
      friendships_second.map(friendship => {
        if (friendship.status === 'friends') {
          friendsIds.push(Number(friendship.user_second_id));
          friendship.dataValues.customStatus = 'friends';
        }
        if (friendship.status === 'pending_first_second') {
          friendship.dataValues.customStatus = 'sent';
        }
        if (friendship.status === 'pending_second_first') {
          friendship.dataValues.customStatus = 'received';
        }
        return friendship;
      });
    }

    let friendships = [...friendships_first, ...friendships_second];

    req.friendsIds = friendsIds;
    req.friendships = friendships;
    req.first = friendships_first;
    req.second = friendships_second;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
