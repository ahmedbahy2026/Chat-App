import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authController from '../controllers/auth.controller.js';
import { uploadPhoto, resizePhoto } from '../middlewares/multer.middlewares.js';

const router = express.Router();
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(uploadPhoto, resizePhoto, userController.updateUser)
  .delete(userController.deleteUser);

export default router;
