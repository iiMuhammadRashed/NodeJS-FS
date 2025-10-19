import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';
import logger from '../config/logger.js';
import { createRandomSlug } from './slugifyUtil.js';

/**
 * Process and optimize image
 * @param {Buffer} buffer - Image buffer from multer
 * @param {Object} options - Processing options
 * @returns {Promise<Buffer>} - Processed image buffer
 */
export const optimizeImage = async (buffer, options = {}) => {
  const defaultOptions = {
    width: 1200,
    height: 1200,
    fit: 'inside',
    quality: 85,
    format: 'webp',
    ...options,
  };

  try {
    const processed = await sharp(buffer)
      .resize(defaultOptions.width, defaultOptions.height, {
        fit: defaultOptions.fit,
        withoutEnlargement: true,
      })
      .toFormat(defaultOptions.format, { quality: defaultOptions.quality })
      .toBuffer();

    return processed;

  } catch (error) {
    logger.error('Image optimization failed:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Generate thumbnail
 * @param {Buffer} buffer - Image buffer
 * @param {number} size - Thumbnail size (width and height)
 * @returns {Promise<Buffer>} - Thumbnail buffer
 */
export const generateThumbnail = async (buffer, size = 300) => {
  try {
    const thumbnail = await sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    return thumbnail;

  } catch (error) {
    logger.error('Thumbnail generation failed:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

/**
 * Upload image to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with publicId and url
 */
export const uploadToCloudinary = async (buffer, folder = 'uploads', options = {}) => {
  if (!cloudinary) {
    throw new Error('Cloudinary is not configured');
  }

  try {
    // Convert buffer to base64
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/webp;base64,${base64}`;

    const uploadOptions = {
      folder,
      resource_type: 'image',
      public_id: `${folder}_${createRandomSlug(12)}`,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
      ...options,
    };

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };

  } catch (error) {
    logger.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = async (publicId) => {
  if (!cloudinary) {
    logger.warn('Cloudinary not configured. Cannot delete image.');
    return { success: false };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
    return result;

  } catch (error) {
    logger.error('Cloudinary deletion failed:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Complete image processing pipeline
 * Optimize → Upload to Cloudinary
 * @param {Buffer} buffer - Original image buffer
 * @param {string} folder - Cloudinary folder
 * @param {Object} processOptions - Image processing options
 * @returns {Promise<Object>} - Upload result
 */
export const processImage = async (buffer, folder = 'uploads', processOptions = {}) => {
  try {
    // Step 1: Optimize image
    const optimized = await optimizeImage(buffer, processOptions);

    // Step 2: Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(optimized, folder);

    logger.info(`Image processed and uploaded: ${uploadResult.publicId}`);
    return uploadResult;

  } catch (error) {
    logger.error('Image processing pipeline failed:', error);
    throw error;
  }
};

/**
 * Process multiple images in parallel
 * @param {Array<Buffer>} buffers - Array of image buffers
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Array<Object>>} - Array of upload results
 */
export const processMultipleImages = async (buffers, folder = 'uploads') => {
  try {
    const uploadPromises = buffers.map(buffer => processImage(buffer, folder));
    const results = await Promise.all(uploadPromises);
    return results;

  } catch (error) {
    logger.error('Multiple image processing failed:', error);
    throw error;
  }
};

/**
 * Get image metadata
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<Object>} - Image metadata
 */
export const getImageMetadata = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
    };

  } catch (error) {
    logger.error('Failed to get image metadata:', error);
    throw error;
  }
};

export default {
  optimizeImage,
  generateThumbnail,
  uploadToCloudinary,
  deleteImage,
  processImage,
  processMultipleImages,
  getImageMetadata,
};
