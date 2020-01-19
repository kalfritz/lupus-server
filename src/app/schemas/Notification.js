import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: false,
    },
    user: {
      type: Number,
      required: true,
    },
    user_avatar: {
      type: String,
      required: false,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Notifications', notificationSchema);
