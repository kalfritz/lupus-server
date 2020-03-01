import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';

export default async (req, res, next) => {
  const { userId: user_id } = req;
  try {
    const relationships = await UserRelationship.findAll({
      where: {
        status: {
          [Op.or]: ['block_first_second', 'block_second_first', 'block_both'],
        },
        [Op.or]: [
          {
            user_first_id: user_id,
          },
          {
            user_second_id: user_id,
          },
        ],
      },
    });

    let blocksIds = [];

    if (relationships.length > 0) {
      relationships.forEach(relationship => {
        if (relationship.dataValues.user_first_id === user_id) {
          blocksIds.push(Number(relationship.dataValues.user_second_id));
        } else {
          blocksIds.push(Number(relationship.dataValues.user_first_id));
        }
      });
    }

    req.blocksIds = blocksIds;

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
