import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({
      where: { email },
    });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, username } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        username,
      },
      token: await User.signToken({ id }),
    });
  }
}

export default new SessionController();
