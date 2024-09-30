import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';
import logger from './logger/winston.logger.js';

dotenv.config({ path: './config.env' });

const port = process.env.PORT || 4000;

const startServer = () => {
  app.listen(port, () => {
    logger.info(`📑 Visit the documentation at: http://localhost:${port}`);
    logger.info('⚙️  Server is running on port: ' + port);
  });
};

try {
  await connectDB();
  startServer();
} catch (err) {
  logger.error('Mongo db connect error: ', err);
}
