import mongoose from 'mongoose';
import logger from '../logger/winston.logger.js';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const MONGODB_URI = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(MONGODB_URI);
    logger.info(
      `\n☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`
    );
  } catch (error) {
    logger.error('MongoDB connection error: ', error);
    process.exit(1);
  }
};

export default connectDB;
