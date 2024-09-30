import morgan from 'morgan';
import logger from './winston.logger.js';

const getLogFormat = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development'
    ? ':remote-addr :method :url :status - :response-time ms'
    : ':method :url :status';
};

const stream = {
  write: (message) => logger.http(message.trim())
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

const morganMiddleware = morgan(getLogFormat(), {
  stream,
  skip
});

morgan.token('err', (req, res) => {
  if (res.statusCode >= 400) {
    return res.statusCode >= 500 ? 'Server Error' : 'Client Error';
  }
  return null;
});

export default morganMiddleware;
