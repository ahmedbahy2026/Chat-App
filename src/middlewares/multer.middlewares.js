import multer from 'multer';
import asyncHandler from 'express-async-handler';
import sharp from 'sharp';

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public');
//   },
//   filename: function (req, file, cb) {
//     // const filename = `photo-${req.user._id}-${Date.now()}`;
//     const filename = 'photo-monica-basma';
//     cb(null, filename);
//   }
// });

// export const upload = multer({ storage });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

export const uploadPhoto = upload.fields([{ name: 'photo', maxCount: 1 }]);

export const resizePhoto = asyncHandler(async (req, res, next) => {
  if (!req.files.photo) return next();
  req.body.photo = `user-${req.params.id}-${Date.now()}-photo.jpeg`;
  await sharp(req.files.photo[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/temp/${req.body.photo}`);

  next();
});
