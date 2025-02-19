import { Op } from 'sequelize';
import User from '../models/User';
import File from '../models/File';

import MakeFriendsOnSignUp from '../services/MakeFriendsOnSignUp';

import Notification from '../schemas/Notification';

import Cache from '../../lib/Cache';

class UserController {
  async index(req, res) {
    const { blocksIds = [] } = req.params;
    const { q = '', page = 1, limit = 8 } = req.query;

    try {
      console.log('hit');
      const users = await User.findAll({
        limit,
        offset: (page - 1) * limit,
        where: {
          [Op.or]: [
            {
              username: {
                [Op.iLike]: `%${q}%`,
              },
            },
            {
              name: {
                [Op.iLike]: `%${q}%`,
              },
            },
          ],
          id: { [Op.notIn]: blocksIds },
        },
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'name', 'path', 'url'],
          },
          {
            model: File,
            as: 'cover',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      return res.json(users);
    } catch (err) {
      console.log(err);
    }
  }

  async store(req, res) {
    const { email, username } = req.body;
    try {
      const checkUsername = await User.findOne({ where: { username } });
      if (checkUsername) {
        return res.status(400).json({ error: 'Duplicated username' });
      }
      const checkEmail = await User.findOne({ where: { email } });
      if (checkEmail) {
        return res.status(400).json({ error: 'Duplicated email' });
      }
      const user = await User.create(req.body);

      user.avatar_id = 11;
      user.cover_id = 12;
      await user.save();
      const { id } = user;

      await Promise.all([
        MakeFriendsOnSignUp.run({ user_id: id }),
        Notification.create({
          context: 'welcome',
          recepient: id,
          dispatcher: {
            id: 130,
            username: 'gandalf',
            name: 'Gandalf',
            avatar: `${process.env.APP_URL}files/gandalf-pfp.jpg`,
          },
        }),
      ]);

      return res.json({
        user: { id, username, email },
        token: await User.signToken({ id }),
      });
    } catch (err) {
      return console.log(err);
    }
  }

  async update(req, res) {
    const { userId } = req;
    const { email, oldPassword } = req.body;

    const user = await User.scope('withPassword').findByPk(userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({
        where: {
          email,
        },
      });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    if (oldPassword) {
      if (!req.body.password) {
        return res.status(401).json({ error: 'Provide the new password' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    await user.update(req.body);

    const {
      id,
      name,
      username,
      avatar,
      cover,
      location,
      bio,
    } = await User.findByPk(userId, {
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
        { model: File, as: 'cover', attributes: ['id', 'path', 'url'] },
      ],
    });

    Cache.invalidatePrefix(`user:${userId}`);

    return res.json({
      id,
      name,
      email,
      username,
      cover,
      avatar,
      location,
      bio,
    });
  }

  async delete(req, res) {
    const { userId } = req;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User does not exist');
    }

    if (user.id !== userId) {
      throw new Error('You do not have permission');
    }

    const deletedUser = await user.destroy();

    Cache.invalidatePrefix(`user:${userId}`);

    return res.json(deletedUser);
  }

  async show(req, res) {
    const { username } = req.params;

    console.log(username);

    const user = await User.findOne({
      where: {
        username,
      },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
        {
          model: File,
          as: 'cover',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json(user);
  }
}

export default new UserController();
