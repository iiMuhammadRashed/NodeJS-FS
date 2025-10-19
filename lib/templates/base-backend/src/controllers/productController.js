import Product from '../models/Product.js';
import { AppError } from '../middlewares/errorHandler.js';
import { processImage, deleteImage } from '../utils/imageProcessor.js';
import logger from '../config/logger.js';



export const getAllProducts = async (req, res, next) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    
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

    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    
    let sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 };
    }

    
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



export const getProduct = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    
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



export const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id,
    };

    
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
    
    if (req.uploadedImages) {
      req.uploadedImages.forEach(img => deleteImage(img.publicId).catch(() => {}));
    }
    next(error);
  }
};



export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    
    if (req.files && req.files.length > 0) {
      
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map(img => 
          deleteImage(img.publicId)
        );
        await Promise.allSettled(deletePromises);
      }

      
      const imagePromises = req.files.map(file => 
        processImage(file.buffer, 'products')
      );
      const uploadedImages = await Promise.all(imagePromises);
      req.body.images = uploadedImages;
    }

    
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



export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    
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
