import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';



const configureCloudinary = () => {
  try {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      logger.warn('⚠️  Cloudinary credentials not found. Image upload will be disabled.');
      return null;
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });

    logger.info('☁️  Cloudinary configured successfully');
    return cloudinary;

  } catch (error) {
    logger.error('❌ Cloudinary configuration failed:', error.message);
    return null;
  }
};

const cloudinaryInstance = configureCloudinary();

export default cloudinaryInstance;
