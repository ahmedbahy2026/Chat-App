import mongoose from 'mongoose';
import * as factory from './factoryHandler.js';
import Message from '../models/message.model.js';
import Chat from '../models/chat.model.js';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/appError.js';
import { removeLocalFile } from '../utils/helpers.js';
import { emitSocketEvent } from '../socket/index.js';
import { ChatEventEnum } from '../constants.js';
import { getStaticFilePath, getLocalPath } from '../utils/helpers.js';

export const getAllMessages = factory.getAll(Message);
export const getMessage = factory.getOne(Message);
export const createMessage = factory.createOne(Message);
// export const deleteMessage = factory.deleteOne(Message);
export const updateMessage = factory.updateOne(Message);

const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'sender',
        as: 'sender',
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              email: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        sender: { $first: '$sender' }
      }
    }
  ];
};

export const getCahtMessages = asyncHandler(async (req, res, next) => {
  // Authenticate that the user should be in a participant in this chat
  const { chatId } = req.params;
  const chats = await Chat.findById(chatId);
  if (!chats.participants.includes(req.user._id)) {
    return next(
      new AppError('You cannot get the chat messages, join to group first', 401)
    );
  }

  const messages = await Message.aggregate([
    {
      $match: {
        chat: new mongoose.Schema.ObjectId(chatId)
      }
    },
    ...chatMessageCommonAggregation(),
    {
      $sort: { createdAt: -1 }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, messages || [], 'Messages fetched successfully')
    );
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  // 1) Find the chat based on chatId and checking if user is a participant of the chat
  const { chatId, messageId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat.participants.includes(req.user_id)) {
    return next(new AppError('Chat does not exist', 404));
  }
  // 2) Find the message based on message id
  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError('Message does not exist', 404));
  }
  // 3) Check if user is the sender of the message
  if (message.sender !== req.user_id) {
    return next(new AppError(`You don't have access for this action`, 401));
  }
  if (message.attachments.length) {
    message.attachments.map((attatchment) =>
      removeLocalFile(attatchment.localPath)
    );
  }
  // 4) Deleting the message from DB
  await Message.findByIdAndDelete(messageId);
  // 5) Updating the last message of the chat to the previous message after deletion if the message deleted was last message
  if (chat.lastMessage === messageId) {
    const lastMessage = await Message.findOne(
      { chat: chatId },
      {},
      { createdAt: -1 }
    );
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: lastMessage ? lastMessage : null
    });
  }
  // 6) Logic to emit socket event about the message deleted  to the other participants
  chat.participants.forEach((participantId) => {
    if (participantId === req.user_id) return;
    emitSocketEvent(
      req,
      participantId.toString(),
      ChatEventEnum.MESSAGE_DELETE_EVENT,
      message
    );
  });
  // 7) Send RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, message, 'Message deleted successfully'));
});

export const sendMessage = asyncHandler(async (req, res, next) => {
  // 1) Get chatId and message content and message attachment
  const { chatId } = req.params;
  const { content } = req.body;
  if (!content && !req.files?.attachments?.length) {
    return next(new AppError('Message content or attachment is required', 404));
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError(`Chat is not Found`, 404));
  }
  let attachments = [];
  if (req.files?.attachments?.length) {
    req.files.attachments.map((attachment) =>
      attachments.push({
        url: getStaticFilePath(req, attachment.filename),
        localPath: getLocalPath(attachment.filename)
      })
    );
  }

  // 2) Create Message
  const message = await Message.create({
    content,
    attachments,
    sender: req.user_id,
    chat: chatId
  });

  // 3) Update Chat Last Message
  await Chat.findByIdAndUpdate(chatId, { lastMessage: message });

  // Get Received Message(Last Message) for emitting to participants
  const messages = await Message.aggregate([
    {
      $match: {
        _id: new mongoose.Schema.ObjectId(message._id)
      }
    },
    ...chatMessageCommonAggregation()
  ]);
  const receivedMessage = message[0];

  // 4) Logic to emit socket events
  chat.participants.forEach((participant) => {
    if (participant === message.sender) return;
    emitSocketEvent(
      req,
      chatId,
      ChatEventEnum.MESSAGE_RECEIVED_EVENT,
      receivedMessage
    );
  });

  // 5) Send Response
  return res
    .status(201)
    .json(
      new ApiResponse(200, receivedMessage, 'Message received successfully')
    );
});
