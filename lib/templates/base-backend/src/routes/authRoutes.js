import express from 'express';
import Joi from 'joi';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Validation schemas
const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  }),
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().min(8).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .message('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  }),
};

// Public routes with rate limiting
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.patch('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, validate(updateProfileSchema), updateProfile);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;
