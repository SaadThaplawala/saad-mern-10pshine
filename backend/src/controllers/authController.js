const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * User Signup Controller
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JWT token and user info or error message
 */
const signup = async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      logger.warn('Signup attempted with missing fields');
      return res.status(400).json({
        success: false,
        message: 'Email, password, and confirmPassword are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn(`Signup attempted with invalid email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      logger.warn(`Signup attempted with mismatched passwords for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate password length
    if (password.length < 6) {
      logger.warn(`Signup attempted with weak password for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      logger.warn(`Signup attempted with existing email: ${email}`);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create(email, hashedPassword);
    logger.info(`New user created: ${newUser.email}`);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    next(error);
  }
};

/**
 * User Login Controller
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} JWT token and user info or error message
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      logger.warn('Login attempted with missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn(`Login attempt for non-existent user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    logger.info(`User logged in: ${email}`);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

module.exports = {
  signup,
  login
};
