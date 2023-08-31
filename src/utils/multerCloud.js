import multer from 'multer';
import { AppError } from './AppError.js';

export const allowedTypes = {
  image: ['image/jpeg', 'image/png', 'image/jpg'],
  video: ['video/mp4'],
  document: ['application/pdf'],
};
export const multerCloudinary = (fileValidation) => {
  const storage = multer.diskStorage({});

  function fileFilter(req, file, cb) {
    if (fileValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('image only', 400), false);
    }
  }
  const upload = multer({ fileFilter, storage });
  return upload;
};
