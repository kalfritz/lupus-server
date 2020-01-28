import User from '../models/User';
import File from '../models/File';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.scope('withPassword').findOne({
      where: { email },
      include: [
        { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, username, avatar } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        username,
        avatar,
      },
      token: await User.signToken({ id }),
    });
  }
}

export default new SessionController();
