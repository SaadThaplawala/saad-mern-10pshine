const logger = require('../config/logger');

/**
 * Global Error Handler Middleware
 * Catches and logs all errors from routes and other middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error response
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // Send error response
  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
