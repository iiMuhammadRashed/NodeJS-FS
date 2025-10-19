import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../middlewares/errorHandler.js';
import { sendEmail } from '../utils/mailer.js';
import logger from '../config/logger.js';

/**
 * Send tokens in response
 */
const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to database
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Send refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, cookieOptions);

  // Remove sensitive data from output
  user.password = undefined;
  user.refreshToken = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user,
      accessToken,
    },
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 409));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email (async, don't wait)
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
    sendEmail({
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking: ${verificationUrl}`,
    }).catch(err => logger.error('Email sending failed:', err));

    logger.info(`New user registered: ${user.email}`);

    // Send response with tokens
    await sendTokenResponse(user, 201, res, 'Registration successful. Please check your email for verification.');

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if account is locked
    if (user.isLocked) {
      return next(new AppError('Account temporarily locked due to multiple failed login attempts', 423));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 403));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return next(new AppError('Invalid email or password', 401));
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    logger.info(`User logged in: ${user.email}`);

    // Send response with tokens
    await sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    // Clear refresh token from database
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });

    // Clear cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new AppError('Refresh token not found', 401));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new tokens
    await sendTokenResponse(user, 200, res, 'Token refreshed');

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Refresh token expired. Please login again.', 401));
    }
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: { user },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/auth/me
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Don't allow password update here
    if (req.body.password) {
      return next(new AppError('Please use /change-password to update password', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PATCH /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    // Send new tokens
    await sendTokenResponse(user, 200, res, 'Password changed successfully');

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click here to reset: ${resetUrl}\n\nThis link expires in 10 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);

    // Send new tokens
    await sendTokenResponse(user, 200, res, 'Password reset successful');

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Hash token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.info(`Email verified for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    next(error);
  }
};
