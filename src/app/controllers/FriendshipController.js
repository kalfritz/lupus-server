import User from '../models/User';
import File from '../models/File';
import UserRelationship from '../models/UserRelationship';

import Cache from '../../lib/Cache';

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
    try {
      let { userId } = req;
      let { person_id } = req.params;

      userId = Number(userId);
      person_id = Number(person_id);

      if (userId === person_id) {
        throw new Error('You cannot be your own friend.');
      }
      console.log({ userId, person_id });

      let friendship = await UserRelationship.findOne({
        where: {
          [Op.or]: [
            {
              user_first_id: userId,
              user_second_id: person_id,
            },
            {
              user_first_id: person_id,
              user_second_id: userId,
            },
          ],
        },
      });

      if (!friendship) {
        return res.json({
          customStatus: 'add',
        });
      }

      if (userId < person_id && friendship.status === 'pending_first_second') {
        friendship.dataValues.customStatus = 'sent';
      }
      if (userId < person_id && friendship.status === 'pending_second_first') {
        friendship.dataValues.customStatus = 'received';
      }
      if (userId > person_id && friendship.status === 'pending_second_first') {
        friendship.dataValues.customStatus = 'sent';
      }
      if (userId > person_id && friendship.status === 'pending_first_second') {
        friendship.dataValues.customStatus = 'received';
      }
      if (friendship.status === 'friends') {
        friendship.dataValues.customStatus = 'friends';
      }

      return res.json(friendship);
    } catch (err) {
      console.log(err);
    }
  }
  async store(req, res) {
    try {
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

      Promise.all([
        Cache.invalidatePrefix(`user:${Number(user_first_id)}`),
        Cache.invalidatePrefix(`user:${Number(user_second_id)}`),
      ]);

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
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            });

            await Promise.all([
              Notification.create({
                context: 'friendship',
                recepient: userId,
                dispatcher: {
                  id: person_id,
                  username: person.username,
                  name: person.name ? person.name : null,
                  avatar: person.avatar ? person.avatar.url : null,
                },
              }),
              Notification.create({
                context: 'friendship',
                recepient: person_id,
                dispatcher: {
                  id: userId,
                  username: user.username,
                  name: user.name ? user.name : null,
                  avatar: user.avatar ? user.avatar.url : null,
                },
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
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            });

            await Promise.all([
              Notification.create({
                context: 'friendship',
                recepient: userId,
                dispatcher: {
                  id: person_id,
                  username: person.username,
                  name: person.name ? person.name : null,
                  avatar: person.avatar ? person.avatar.url : null,
                },
              }),
              Notification.create({
                context: 'friendship',
                recepient: person_id,
                dispatcher: {
                  id: userId,
                  username: user.username,
                  name: user.name ? user.name : null,
                  avatar: user.avatar ? user.avatar.url : null,
                },
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
    } catch (err) {
      console.log(err);
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

    Promise.all([
      Cache.invalidatePrefix(`user:${Number(user_first_id)}`),
      Cache.invalidatePrefix(`user:${Number(user_second_id)}`),
    ]);

    return res.json(deletedRelationship);
  }
}

export default new FriendshipController();
