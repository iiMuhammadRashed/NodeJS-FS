import { AppError } from './errorHandler.js';

/**
 * Validation middleware factory
 * Validates request data against a Joi schema
 * 
 * @param {Object} schema - Joi schema object with optional body, query, params keys
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors, not just the first one
      allowUnknown: true, // Allow unknown keys that will be stripped
      stripUnknown: true, // Remove unknown keys from validated data
    };

    // Validate request body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        return next(new AppError('Validation failed', 400, true, errors));
      }
      req.body = value; // Replace with validated and sanitized data
    }

    // Validate query parameters
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        return next(new AppError('Query validation failed', 400, true, errors));
      }
      req.query = value;
    }

    // Validate URL parameters
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        return next(new AppError('Params validation failed', 400, true, errors));
      }
      req.params = value;
    }

    next();
  };
};

export default validate;
