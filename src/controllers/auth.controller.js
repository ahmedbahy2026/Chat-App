import asyncHandler from 'express-async-handler';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import {
  uploadOnCloudinary,
  deleteFromCloudinary
} from '../utils/cloudinary.js';
import User from '../models/user.model.js';
import { sendEmail, forgotPasswordMailgenContent } from '../utils/email2.js';

const generateAccessAndRefreshTokens = async function (user, next) {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    return next(
      new AppError(
        'Something went wrong while generating the access token',
        500
      )
    );
  }
};

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword, photo } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return next(
      new AppError(
        400,
        'Please make sure that you provide your name, email, password and confirm password'
      )
    );
  }
  const photoPath = req.files?.photo[0]?.path;
  // const photoPath = 'photo.jpeg';
  if (photoPath) {
    photo = await uploadOnCloudinary(photoPath);
  }

  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    photo
  });

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    return next(
      new AppError('something went wrong when regestring the user', 500)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: createdUser
    }
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide you email and password', 401));
  }

  const user = await User.findOne({ email });
  if (!user || !user.checkPassword(password)) {
    return next(new AppError('Wrong email or password', 401));
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user,
    next
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json({
      status: 'success',
      data: {
        user: loggedInUser,
        accessToken,
        refreshToken
      }
    });
});

export const logout = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
    $unset: { refreshToken: 1 }
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json({ status: 'success' });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const informedRefreshToekn =
    req.cookies.refreshToken || req.body?.refreshToken;
  if (!informedRefreshToekn) {
    return next(new AppError(`refresh token doesn't exist`, 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new AppError('Invalid refresh token', 401));
    }
    if (informedRefreshToekn !== user.refreshToken) {
      return next(new AppError('Refresh token is expired or used', 401));
    }
    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
      user,
      next
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json({
        status: 'success',
        message: 'Access Token is refreshed',
        data: {
          user,
          refreshToken,
          accessToken
        }
      });
  } catch (err) {
    return next(new AppError(err.message, 401));
  }
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide your email', 401));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Incorrect email, please try again later.', 401));
  }

  // create reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send email
  // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const resetURL = `http://localhost:3000/forgot-password/${resetToken}`;

  try {
    await sendEmail({
      email: user?.email,
      subject: 'Password reset request',
      mailgenContent: forgotPasswordMailgenContent(user.name, resetURL)
    });
    console.log('sent successfully');
  } catch (err) {
    console.log(err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Email was send successfully'
  });
});
