import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  return nodemailer.createTransporter(config);
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 */
export const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email credentials not configured. Skipping email send.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to MERN Stack App!';
  const text = `Hi ${name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`;
  const html = `
    <h1>Welcome ${name}!</h1>
    <p>We're excited to have you on board.</p>
    <p>Best regards,<br>The Team</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Password Reset Request';
  const text = `You requested a password reset. Click the link to reset your password: ${resetUrl}\n\nThis link expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>Or copy this link: ${resetUrl}</p>
    <p><strong>This link expires in 10 minutes.</strong></p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Send email verification
 */
export const sendVerificationEmail = async (email, verificationUrl) => {
  const subject = 'Verify Your Email Address';
  const text = `Please verify your email address by clicking: ${verificationUrl}\n\nThis link expires in 24 hours.`;
  const html = `
    <h2>Email Verification</h2>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>Or copy this link: ${verificationUrl}</p>
    <p><strong>This link expires in 24 hours.</strong></p>
  `;

  return sendEmail({ to: email, subject, text, html });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
};
