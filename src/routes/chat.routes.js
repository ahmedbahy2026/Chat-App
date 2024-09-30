import express from 'express';
import * as chatController from '../controllers/chat.controller.js';

const router = express.Router();

router
  .route('/')
  .get(chatController.getAllChats)
  .post(chatController.createChat);

router
  .route('/:id')
  .get(chatController.getChat)
  .patch(chatController.updateChat)
  .delete(chatController.deleteChat);

export default router;
