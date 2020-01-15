import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';

export default async (req, res, next) => {
  const { userId: user_id } = req;

  try {
    const [blocks_first, blocks_second] = await Promise.all([
      UserRelationship.findAll({
        where: {
          [Op.or]: [{ status: 'block_first_second' }, { status: 'block_both' }],
          user_first_id: user_id,
        },
      }),
      UserRelationship.findAll({
        where: {
          status: 'block_second_first',
          user_second_id: user_id,
        },
      }),
    ]);

    let blocksIds = [];

    if (blocks_first.length > 0) {
      blocks_first.forEach(relationship =>
        blocksIds.push(Number(relationship.user_second_id))
      );
    }
    if (blocks_second.length > 0) {
      blocks_second.forEach(relationship =>
        blocksIds.push(Number(relationship.user_first_id))
      );
    }
    req.blocksIds = blocksIds;
    next();
  } catch (err) {
    return res.status(500).json(err);
  }
};
