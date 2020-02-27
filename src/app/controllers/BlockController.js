import User from '../models/User';
import File from '../models/File';
import UserRelationship from '../models/UserRelationship';
import { Op } from 'sequelize';

class BlockController {
  async index(req, res) {
    const { userId } = req;
    const relationships = await UserRelationship.findAll({
      where: {
        [Op.or]: [
          {
            status: 'block_first_second',
            user_first_id: userId,
          },
          {
            status: 'block_second_first',
            user_second_id: userId,
          },
          {
            status: 'block_both',
            [Op.or]: [{ user_first_id: userId }, { user_second_id: userId }],
          },
        ],
      },
    });

    console.log(relationships);

    let blocksIds = [];

    if (relationships.length > 0) {
      relationships.forEach(relationship => {
        if (relationship.dataValues.user_first_id === userId) {
          blocksIds.push(Number(relationship.dataValues.user_second_id));
        } else {
          blocksIds.push(Number(relationship.dataValues.user_first_id));
        }
      });
    }

    console.log(blocksIds);

    const blockedUsers = await User.findAll({
      where: {
        id: {
          [Op.in]: blocksIds,
        },
      },
      include: {
        model: File,
        as: 'avatar',
        attributes: ['id', 'path', 'url'],
      },
    });

    return res.json(blockedUsers);
  }

  async store(req, res) {
    const { userId } = req;
    const { person_id } = req.params;

    let user_first_id = 0;
    let user_second_id = 0;
    let defaultStatus = '';

    if (userId === person_id) {
      throw new Error('You cannot block yourself');
    }

    if (userId < person_id) {
      user_first_id = Number(userId);
      user_second_id = Number(person_id);
      defaultStatus = 'block_first_second';
    } else {
      user_first_id = Number(person_id);
      user_second_id = Number(userId);
      defaultStatus = 'block_second_first';
    }

    const person = await User.findByPk(person_id);

    if (!person) {
      throw new Error('Sorry. This user does not exist');
    }

    const [relationship, created] = await UserRelationship.findOrCreate({
      where: {
        user_first_id,
        user_second_id,
      },
      defaults: {
        status: defaultStatus,
      },
    });

    if (created) {
      return res.json(relationship);
    } else {
      if (user_first_id === userId) {
        if (
          relationship.status === 'pending_first_second' ||
          relationship.status === 'pending_second_first' ||
          relationship.status === 'friends'
        ) {
          relationship.status = 'block_first_second';
          await relationship.save();
          return res.json(relationship);
        }

        if (
          relationship.status === 'block_first_second' ||
          relationship.status === 'block_both'
        ) {
          throw new Error('User already blocked');
        }
        if (relationship.status === 'block_second_first') {
          relationship.status = 'block_both';
          await relationship.save();
          return res.json(relationship);
        }
      } else {
        if (
          relationship.status === 'pending_first_second' ||
          relationship.status === 'pending_second_first' ||
          relationship.status === 'friends'
        ) {
          relationship.status = 'block_second_first';
          await relationship.save();
          return res.json(relationship);
        }
        if (
          relationship.status === 'block_second_first' ||
          relationship.status === 'block_both'
        ) {
          throw new Error('User already blocked');
        }
        if (relationship.status === 'block_first_second') {
          relationship.status = 'block_both';
          await relationship.save();
          return res.json(relationship);
        }
      }
    }
  }
}

export default new BlockController();
