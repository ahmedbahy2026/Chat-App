import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { uploadPhoto, resizePhoto } from '../middlewares/multer.middlewares.js';
import verifyJWT from '../middlewares/verifyJWT.middlewares.js';

const router = express.Router();

router.post('/register', uploadPhoto, resizePhoto, authController.registerUser);
router.get('/login', authController.login);
router.post('/logout', verifyJWT, authController.logout);
router.post('/refresh-token', authController.refreshAccessToken);
router.post('/forgetPassword', authController.forgetPassword);

export default router;
