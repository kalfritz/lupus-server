import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  text: String,
  post_id: Number,
  post_picture: String,
  comment_id: Number,
  comment_picture: String,
});

const dispatcherSchema = new mongoose.Schema({
  id: Number,
  name: String,
  username: String,
  avatar: String,
});

const notificationSchema = new mongoose.Schema(
  {
    context: {
      type: String,
      enum: ['like_post', 'like_comment', 'comment_post', 'friendship'],
      required: true,
    },
    recepient: {
      type: Number,
      required: true,
    },
    content: contentSchema,
    dispatcher: dispatcherSchema,
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
