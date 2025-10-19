import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: 'Discount price must be less than regular price',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['electronics', 'clothing', 'food', 'books', 'toys', 'other'],
        message: '{VALUE} is not a valid category',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: [
      {
        publicId: String,
        url: String,
        alt: String,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot exceed 5'],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specifications: {
      type: Map,
      of: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Text search

// Virtual for in stock status
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.discountPrice && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for final price (considering discount)
productSchema.virtual('finalPrice').get(function () {
  return this.discountPrice || this.price;
});

// Generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
  }
  next();
});

// Ensure slug is unique by appending a number if needed
productSchema.pre('save', async function (next) {
  if (this.isModified('slug')) {
    let slug = this.slug;
    let count = 1;
    
    while (true) {
      const existing = await this.constructor.findOne({ 
        slug: this.slug, 
        _id: { $ne: this._id } 
      });
      
      if (!existing) break;
      
      this.slug = `${slug}-${count}`;
      count++;
    }
  }
  next();
});

// Static method: Find products by category
productSchema.statics.findByCategory = function (category, options = {}) {
  return this.find({ category, isActive: true, ...options });
};

// Static method: Find featured products
productSchema.statics.findFeatured = function (limit = 10) {
  return this.find({ featured: true, isActive: true }).limit(limit);
};

// Static method: Search products
productSchema.statics.search = function (query, options = {}) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' }, ...options }
  ).sort({ score: { $meta: 'textScore' } });
};

// Instance method: Update stock
productSchema.methods.updateStock = async function (quantity) {
  this.stock += quantity;
  if (this.stock < 0) {
    throw new Error('Insufficient stock');
  }
  await this.save();
  return this;
};

const Product = mongoose.model('Product', productSchema);

export default Product;
