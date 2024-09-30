import fs from 'fs';
import logger from '../logger/winston.logger.js';

export const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (err) => {
    if (err) logger.error('Error while removing local files: ', err);
    else {
      logger.info('Removed local: ', localPath);
    }
  });
};

export const getStaticFilePath = (req, fileName) => {
  return `${req.protocol}://${req.get('host')}/images/${fileName}`;
};

export const getLocalPath = (fileName) => {
  return `public/images/${fileName}`;
};
