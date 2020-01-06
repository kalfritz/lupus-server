import User from '../models/User';

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
}

export default new UserController();
