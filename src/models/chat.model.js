import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Each chat must have a name'],
      unique: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['group', 'private'],
      default: 'group'
    },
    lastMessage: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message'
    },
    admin: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    participants: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
      ],
      default: []
    },
    lastReadMessageByUser: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lastReadMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Message'
        }
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
