import * as factory from './factoryHandler.js';
import Chat from '../models/chat.model.js';
import asyncHandler from 'express-async-handler';
import Message from '../models/message.model.js';
import mongoose from 'mongoose';
import { removeLocalFile } from '../utils/helpers.js';

export const getAllChats = factory.getAll(Chat);
export const getChat = factory.getOne(Chat);
export const createChat = factory.createOne(Chat);
export const deleteChat = factory.deleteOne(Chat);
export const updateChat = factory.updateOne(Chat);

export const deleteCascadeChatMessages = asyncHandler(async (chatId) => {
  // 1) Get the chat messages
  const messages = await Message.find({
    chat: new mongoose.Schema.ObjectId(chatId)
  });

  // 2) Get the chat attachments from messages in (1), then delete them
  let attachments = attachments.concat(
    ...messages.map((message) => message.attatchment)
  );

  attachments.forEach((attachment) => {
    removeLocalFile(attachment.localPath);
  });

  // 3) Delte messages
  await Message.deleteMany({
    chat: new mongoose.Schema.ObjectId(chatId)
  });
});
