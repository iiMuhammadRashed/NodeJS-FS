export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  process.env.MODE == "dev"
    ? res.status(statusCode).json({ err: err.message, stack: err.stack })
    : res.status(statusCode).json({ err: err.message });
};
  