import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const { email, username } = req.body;

    const checkUsername = await User.findOne({ where: { username } });

    if (checkUsername) {
      return res.status(400).json({ error: 'Duplicated username' });
    }

    const checkEmail = await User.findOne({ where: { email } });

    if (checkEmail) {
      return res.status(400).json({ error: 'Duplicated email' });
    }

    const { id, name } = await User.create(req.body);

    return res.json({
      user: { id, username, name, email },
      token: await User.signToken({ id }),
    });
  }
  async update(req, res) {
    const { userId } = req;
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(userId);

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

    const { id, name, username, avatar, location, bio } = await User.findByPk(
      userId,
      {
        include: [
          { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
        ],
      }
    );

    return res.json({ id, name, email, username, avatar, location, bio });
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

    return res.json(deletedUser);
  }
  async show(req, res) {
    const { user_id } = req.params;

    const user = await User.findByPk(user_id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(user);
  }
}

export default new UserController();
