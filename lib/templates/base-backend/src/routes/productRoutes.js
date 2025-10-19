import express from 'express';
import Joi from 'joi';
import multer from 'multer';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();


const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  },
});


const createProductSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    price: Joi.number().min(0).required(),
    discountPrice: Joi.number().min(0).less(Joi.ref('price')),
    category: Joi.string().valid('electronics', 'clothing', 'food', 'books', 'toys', 'other').required(),
    stock: Joi.number().min(0).required(),
    tags: Joi.array().items(Joi.string()),
    featured: Joi.boolean(),
    specifications: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
};

const updateProductSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(2000),
    price: Joi.number().min(0),
    discountPrice: Joi.number().min(0),
    category: Joi.string().valid('electronics', 'clothing', 'food', 'books', 'toys', 'other'),
    stock: Joi.number().min(0),
    tags: Joi.array().items(Joi.string()),
    featured: Joi.boolean(),
    isActive: Joi.boolean(),
    specifications: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
};

const querySchema = {
  query: Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1).max(100),
    category: Joi.string(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    featured: Joi.string().valid('true', 'false'),
    search: Joi.string(),
    sortBy: Joi.string(),
  }),
};


router.get('/', validate(querySchema), getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:idOrSlug', getProduct);


router.post(
  '/',
  protect,
  restrictTo('admin', 'moderator'),
  uploadLimiter,
  upload.array('images', 5),
  validate(createProductSchema),
  createProduct
);

router.patch(
  '/:id',
  protect,
  restrictTo('admin', 'moderator'),
  uploadLimiter,
  upload.array('images', 5),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  deleteProduct
);

export default router;
