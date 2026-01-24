const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * JWT Verification Middleware
 * Verifies JWT token and attaches user info to request
 */
const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Request without valid authorization header');
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    logger.info(`Token verified for user: ${decoded.email}`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Expired token attempt');
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid token attempt');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    logger.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

module.exports = {
  verifyToken
};
// TODO: Implement JWT verification
