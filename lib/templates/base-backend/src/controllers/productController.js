import Product from '../models/Product.js';
import { AppError } from '../middlewares/errorHandler.js';
import { processImage, deleteImage } from '../utils/imageProcessor.js';
import logger from '../config/logger.js';

/**
 * @desc    Get all products (with pagination, filtering, sorting)
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getAllProducts = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isActive: true };
    
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }

    // Search
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Sorting
    let sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/v1/products/:idOrSlug
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    // Try to find by ID first, then by slug
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: idOrSlug } 
      : { slug: idOrSlug };

    const product = await Product.findOne(query).populate('createdBy', 'name email');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { product },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/v1/products
 * @access  Private (Admin, Moderator)
 */
export const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Handle image upload if files are present
    if (req.files && req.files.length > 0) {
      const imagePromises = req.files.map(file => 
        processImage(file.buffer, 'products')
      );
      const uploadedImages = await Promise.all(imagePromises);
      productData.images = uploadedImages;
    }

    const product = await Product.create(productData);

    logger.info(`Product created: ${product.name} by user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });

  } catch (error) {
    // Clean up uploaded images if product creation fails
    if (req.uploadedImages) {
      req.uploadedImages.forEach(img => deleteImage(img.publicId).catch(() => {}));
    }
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PATCH /api/v1/products/:id
 * @access  Private (Admin, Moderator)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map(img => 
          deleteImage(img.publicId)
        );
        await Promise.allSettled(deletePromises);
      }

      // Upload new images
      const imagePromises = req.files.map(file => 
        processImage(file.buffer, 'products')
      );
      const uploadedImages = await Promise.all(imagePromises);
      req.body.images = uploadedImages;
    }

    // Update product
    req.body.updatedBy = req.user._id;
    product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Product updated: ${product.name} by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(img => 
        deleteImage(img.publicId)
      );
      await Promise.allSettled(deletePromises);
    }

    await Product.findByIdAndDelete(id);

    logger.info(`Product deleted: ${product.name} by user: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/v1/products/category/:category
 * @access  Public
 */
export const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.findByCategory(category)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Product.countDocuments({ category, isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.findFeatured(limit);

    res.status(200).json({
      success: true,
      data: { products },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search products
 * @route   GET /api/v1/products/search
 * @access  Public
 */
export const searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return next(new AppError('Search query is required', 400));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.search(q)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: { products },
    });

  } catch (error) {
    next(error);
  }
};
