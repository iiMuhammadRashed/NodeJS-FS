import { AppError } from '../utils/AppError.js';

export const validation = (schema) => {
  return (req, res, next) => {
    let { error } = schema.validate(
      { ...req.body, ...req.params, ...req.query },
      { abortEarly: false }
    );
    let errorArr = [];
    if (error) {
      error.details.forEach((ele) => {
        errorArr.push(ele.message);
      });
      return next(new AppError(errorArr, 400));
    } else {
      next();
    }
  };
};
