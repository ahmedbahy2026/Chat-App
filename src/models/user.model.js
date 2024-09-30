import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      trim: true,
      unique: true
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'User must have an email']
    },
    password: {
      type: String,
      required: [true, 'User must have a password']
    },
    confirmPassword: {
      type: String,
      required: [true, 'User must have a confirm password'],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: `The confirm password doesn't match the password`
      }
    },
    active: {
      type: Boolean,
      default: true
    },
    photo: {
      type: String,
      default: 'default.'
    },
    refreshToken: String,
    hashedResetToken: String,
    resetTokenExpiry: Date
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  });
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.hashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetTokenExpiry = Date.now + process.env.RESET_TOKEN_EXPIRY;
  return;
};

const User = mongoose.model('User', userSchema);

export default User;
