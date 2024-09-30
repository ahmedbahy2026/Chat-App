import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    content: String,
    attachments: {
      type: [
        {
          url: String,
          path: String
        }
      ],
      default: []
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    chat: {
      type: mongoose.Schema.ObjectId,
      ref: 'Chat'
    },
    readBy: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
