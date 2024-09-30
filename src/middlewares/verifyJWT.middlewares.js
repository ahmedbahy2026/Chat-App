import AppError from '../utils/appError.js';
import User from '../models/user.model.js';
import { promisify } from 'util';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies.accessToken || req.headers?.authorization?.split(' ')[1];
  if (!accessToken) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  try {
    const decoded = await promisify(jwt.verify)(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationExpiry'
    );
    if (!user) {
      return next(new AppError('Invalid access token', 401));
    }
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError(err.message, 401));
  }
});

export default verifyJWT;
