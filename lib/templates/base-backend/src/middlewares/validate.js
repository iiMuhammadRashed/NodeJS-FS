import { AppError } from './errorHandler.js';



const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, 
      allowUnknown: true, 
      stripUnknown: true, 
    };

    
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        return next(new AppError('Validation failed', 400, true, errors));
      }
      req.body = value; 
    }

    
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
