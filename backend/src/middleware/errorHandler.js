const loggerService = require('../services/LoggerService');
const ErrorCategorizer = require('../utils/ErrorCategorizer');

/**
 * Enhanced Error Handler Middleware - Single Responsibility: Handle and respond to errors
 * OCP: Can be extended with new error handling strategies (email, Sentry, etc.)
 */
class ErrorHandler {
  constructor(logger = loggerService) {
    this.logger = logger;
  }

  /**
   * Main error handler middleware
   * @param {Error} err - Error object
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Express next function
   */
  middleware() {
    return (err, req, res, next) => {
      // Categorize error
      const category = ErrorCategorizer.categorizeError(err);
      const statusCode = ErrorCategorizer.getStatusCode(err, category);
      const isOperational = ErrorCategorizer.isOperationalError(err);

      // Log error with context
      this._logError(err, category, req, isOperational);

      // Prepare error response
      const errorResponse = this._buildErrorResponse(err, category, statusCode);

      // Send error response
      res.status(statusCode).json(errorResponse);

      // If programmer error, optionally alert/log for monitoring
      if (!isOperational) {
        this.logger.error(`PROGRAMMER ERROR: ${err.message}`, {
          category,
          stack: err.stack,
          requestId: req.id
        });
      }
    };
  }

  /**
   * Log error with detailed context
   * @param {Error} err - Error object
   * @param {string} category - Error category
   * @param {object} req - Express request
   * @param {boolean} isOperational - Whether error is operational
   * @private
   */
  _logError(err, category, req, isOperational) {
    const errorLog = {
      category,
      message: err.message,
      statusCode: err.statusCode || 500,
      isOperational,
      requestId: req.id,
      method: req.method,
      path: req.path,
      userId: req.user?.id || 'anonymous',
      ip: req.ip,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        errorName: err.name,
        errorCode: err.code
      })
    };

    this.logger.error(`Error: ${category}`, errorLog);
  }

  /**
   * Build standardized error response
   * @param {Error} err - Error object
   * @param {string} category - Error category
   * @param {number} statusCode - HTTP status code
   * @returns {object} Error response object
   * @private
   */
  _buildErrorResponse(err, category, statusCode) {
    const response = {
      success: false,
      error: {
        code: category,
        message: ErrorCategorizer.getUserMessage(err, category),
        statusCode,
        requestId: err.requestId || 'unknown'
      }
    };

    // Include validation details if available
    if (err.details && typeof err.details === 'object') {
      response.error.details = err.details;
    }

    // Include original message in development mode
    if (process.env.NODE_ENV === 'development') {
      response.error.debug = {
        originalMessage: err.message,
        timestamp: new Date().toISOString()
      };
    }

    return response;
  }
}

// Export middleware function
module.exports = new ErrorHandler();

