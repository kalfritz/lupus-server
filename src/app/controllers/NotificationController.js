import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const { userId: user_id } = req;

    const notifications = await Notification.find({ recepient: user_id }).sort({
      createdAt: -1,
    });

    return res.json(notifications);
  }
}

export default new NotificationController();
