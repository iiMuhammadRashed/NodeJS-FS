import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import User from '../models/User.js';

/**
 * Verify JWT access token
 */
export const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized. No token provided.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new AppError('User account is deactivated', 403));
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('Password recently changed. Please log in again.', 401));
      }
    }

    // Grant access to protected route
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

/**
 * Role-based access control
 * @param  {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

/**
 * Optional authentication
 * Adds user to request if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};
