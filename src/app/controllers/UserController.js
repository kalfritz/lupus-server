import User from '../models/User';
//import File from '../models/File';

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

    if (email !== user.email) {
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

    const { id, name, username /*,avatar*/ } = await User.findByPk(
      userId /*, {
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    }*/
    );

    return res.json({ id, name, email, username /*, avatar */ });
  }
}

export default new UserController();
