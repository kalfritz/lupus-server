import User from '../models/User';

class UserController {
  async store(req, res) {
    const { email } = req.body;

    const checkEmail = await User.findOne({ where: { email } });

    if (checkEmail) {
      return res.status(400).json({ error: 'Duplicated email' });
    }

    const { id, username, name } = await User.create(req.body);

    return res.json({ id, username, name, email });
  }
}

export default new UserController();
