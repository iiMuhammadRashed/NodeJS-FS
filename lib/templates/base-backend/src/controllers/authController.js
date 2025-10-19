import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../middlewares/errorHandler.js';
import { sendEmail } from '../utils/mailer.js';
import logger from '../config/logger.js';



const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  };

  
  res.cookie('refreshToken', refreshToken, cookieOptions);

  
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



export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 409));
    }

    
    const user = await User.create({
      name,
      email,
      password,
    });

    
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
    sendEmail({
      to: user.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking: ${verificationUrl}`,
    }).catch(err => logger.error('Email sending failed:', err));

    logger.info(`New user registered: ${user.email}`);

    
    await sendTokenResponse(user, 201, res, 'Registration successful. Please check your email for verification.');

  } catch (error) {
    next(error);
  }
};



export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    
    if (user.isLocked) {
      return next(new AppError('Account temporarily locked due to multiple failed login attempts', 423));
    }

    
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 403));
    }

    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return next(new AppError('Invalid email or password', 401));
    }

    
    await user.resetLoginAttempts();

    logger.info(`User logged in: ${user.email}`);

    
    await sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    next(error);
  }
};



export const logout = async (req, res, next) => {
  try {
    
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });

    
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    next(error);
  }
};



export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(new AppError('Refresh token not found', 401));
    }

    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    
    await sendTokenResponse(user, 200, res, 'Token refreshed');

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Refresh token expired. Please login again.', 401));
    }
    next(error);
  }
};



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



export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    
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



export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    
    const user = await User.findById(req.user._id).select('+password');

    
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    
    await sendTokenResponse(user, 200, res, 'Password changed successfully');

  } catch (error) {
    next(error);
  }
};



export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }

    
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    
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



export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password reset for user: ${user.email}`);

    
    await sendTokenResponse(user, 200, res, 'Password reset successful');

  } catch (error) {
    next(error);
  }
};



export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    
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
