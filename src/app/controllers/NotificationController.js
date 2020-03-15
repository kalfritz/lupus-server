import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const { userId: user_id } = req;

    const notifications = await Notification.find({ recepient: user_id }).sort({
      createdAt: -1,
    });

    return res.json(notifications);
  }
  async updateAll(req, res) {
    const { userId: user_id } = req;

    const response = await Notification.updateMany(
      { recepient: user_id },
      { read: true }
    );
    console.log('hit update all');
    return res.json({
      totalNotifs: response.n,
      changedNotifs: response.nModified,
    });
  }
  async update(req, res) {
    const { userId: user_id } = req;
    const { notif_id } = req.params;

    const notification = await Notification.findOne({ _id: notif_id });

    if (notification.recepient !== user_id) {
      throw new Error('You do not have permission');
    }

    notification.read = !notification.read;

    await notification.save();

    return res.json(notification);
  }
  async delete(req, res) {
    const { userId: user_id } = req;
    const { notif_id } = req.params;

    const notification = await Notification.findOne({ _id: notif_id });

    if (notification.recepient !== user_id) {
      throw new Error('You do not have permission');
    }

    notification.remove();

    await notification.save();

    return res.json(notification);
  }
}

export default new NotificationController();
