import express from 'express';
import * as messageController from '../controllers/message.controller.js';

const router = express.Router();

router
  .route('/')
  .get(messageController.getAllMessages)
  .post(messageController.createMessage);

router
  .route('/:id')
  .get(messageController.getMessage)
  .patch(messageController.updateMessage)
  .delete(messageController.deleteMessage);

export default router;
