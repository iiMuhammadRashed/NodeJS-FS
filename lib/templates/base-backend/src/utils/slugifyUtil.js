import slugify from 'slugify';



export const createSlug = (text, options = {}) => {
  const defaultOptions = {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    ...options,
  };

  return slugify(text, defaultOptions);
};

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} text - Text to slugify
 * @param {Function} checkExistsFn - Async function that checks if slug exists
 * @returns {Promise<string>} - Unique slug
 */
export const createUniqueSlug = async (text, checkExistsFn) => {
  let slug = createSlug(text);
  let counter = 1;

  while (await checkExistsFn(slug)) {
    slug = `${createSlug(text)}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Convert filename to slug (removes extension)
 * @param {string} filename - Filename with extension
 * @returns {string} - Slugified filename without extension
 */
export const slugifyFilename = (filename) => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return createSlug(nameWithoutExt);
};

/**
 * Generate slug with timestamp
 * @param {string} text - Text to slugify
 * @returns {string} - Slug with timestamp
 */
export const createSlugWithTimestamp = (text) => {
  const slug = createSlug(text);
  const timestamp = Date.now();
  return `${slug}-${timestamp}`;
};

/**
 * Generate random slug
 * @param {number} length - Length of random part
 * @returns {string} - Random slug
 */
export const createRandomSlug = (length = 8) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export default {
  createSlug,
  createUniqueSlug,
  slugifyFilename,
  createSlugWithTimestamp,
  createRandomSlug,
};
