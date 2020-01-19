import User from '../models/User';
import File from '../models/File';
import UserRelationship from '../models/UserRelationship';

import Notification from '../schemas/Notification';
import { Op } from 'sequelize';

class FriendshipController {
  async index(req, res) {
    const { userId: user_id } = req;

    //query all the friendships that the friend id is on user_first_id
    const friendships = await UserRelationship.findAll({
      where: {
        status: 'friends',
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

    return res.json(friendships);
  }
  async show(req, res) {
    const { userId } = req;
    const { user_id, friend_id } = req.params;

    if (Number(userId) !== Number(user_id)) {
      throw new Error('You do not have permission');
    }

    if (userId === person_id) {
      throw new Error('You cannot be your own friend.');
    }

    const friendship = await UserRelationship.findOne({
      where: {
        status: 'friends',
        [Op.or]: [
          {
            user_first_id: user_id,
            user_second_id: friend_id,
          },
          {
            user_second_id: friend_id,
            user_first_id: user_id,
          },
        ],
      },
    });

    return res.json(friendship);
  }
  async store(req, res) {
    const { userId } = req;
    const { person_id } = req.params;

    if (userId === person_id) {
      throw new Error('You cannot be your own friend.');
    }

    let user_first_id = 0;
    let user_second_id = 0;
    let defaultStatus = '';

    if (userId < person_id) {
      user_first_id = Number(userId);
      user_second_id = Number(person_id);
      defaultStatus = 'pending_first_second';
    } else {
      user_first_id = Number(person_id);
      user_second_id = Number(userId);
      defaultStatus = 'pending_second_first';
    }

    const person = await User.findByPk(person_id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

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
        friendship_time: new Date(),
      },
    });

    if (created) {
      return res.json(relationship);
    } else {
      if (user_first_id === userId) {
        if (relationship.status === 'pending_first_second') {
          throw new Error('Pending Request');
        }
        if (relationship.status === 'pending_second_first') {
          relationship.status = 'friends';
          await relationship.save();

          const user = await User.findByPk(userId, {
            include: [
              { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
            ],
          });

          await Promise.all([
            Notification.create({
              content: `You and ${person.name} are friends now`,
              user: userId,
              user_avatar: person.avatar ? person.avatar.url : null,
            }),
            Notification.create({
              content: `You and ${user.name} are friends now`,
              user: person_id,
              user_avatar: user.avatar ? user.avatar.url : null,
            }),
          ]);

          return res.json(relationship);
        }
        if (relationship.status === 'friends') {
          throw new Error('You are already friends');
        }
        if (relationship.status === 'block_first_second') {
          relationship.status = 'friends';
          await relationship.save();
          return res.json(relationship);
        }
        if (relationship.status === 'block_second_first') {
          throw new Error('Invalid operation');
        }
        if (relationship.status === 'block_both') {
          relationship.status = 'block_second_first';
          await relationship.save();
          return res.json(relationship);
        }
      } else {
        if (relationship.status === 'pending_first_second') {
          relationship.status = 'friends';
          await relationship.save();

          const user = await User.findByPk(userId, {
            include: [
              { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
            ],
          });

          await Promise.all([
            Notification.create({
              content: `You and ${person.name} are friends now`,
              user: userId,
              user_avatar: person.avatar ? person.avatar.url : null,
            }),
            Notification.create({
              content: `You and ${user.name} are friends now`,
              user: person_id,
              user_avatar: user.avatar ? user.avatar.url : null,
            }),
          ]);

          return res.json(relationship);
        }
        if (relationship.status === 'pending_second_first') {
          throw new Error('Pending Request');
        }
        if (relationship.status === 'friends') {
          throw new Error('You are already friends');
        }
        if (relationship.status === 'block_first_second') {
          throw new Error('Invalid operation');
        }
        if (relationship.status === 'block_second_first') {
          relationship.status = 'friends';
          await relationship.save();
          return res.json(relationship);
        }
        if (relationship.status === 'block_both') {
          relationship.status = 'block_first_second';
          await relationship.save();
          return res.json(relationship);
        }
      }
    }
  }
  async delete(req, res) {
    const { userId } = req;
    const { person_id } = req.params;

    let user_first_id = 0;
    let user_second_id = 0;
    let defaultStatus = '';

    if (userId < person_id) {
      user_first_id = Number(userId);
      user_second_id = Number(person_id);
    } else {
      user_first_id = Number(person_id);
      user_second_id = Number(userId);
    }

    const person = await User.findByPk(person_id);

    if (!person) {
      throw new Error('Sorry. This user does not exist');
    }

    const relationship = await UserRelationship.findOne({
      where: {
        user_first_id,
        user_second_id,
      },
    });

    if (!relationship) {
      throw new Error('You are not friends');
    }

    const deletedRelationship = await relationship.destroy();

    return res.json(deletedRelationship);
  }
}

export default new FriendshipController();
