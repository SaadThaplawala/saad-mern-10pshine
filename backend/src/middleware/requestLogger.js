const { v4: uuidv4 } = require('uuid');
const loggerService = require('../services/LoggerService');

/**
 * Request Logger Middleware - Single Responsibility: Track and log requests
 * OCP: Can be extended with new tracking strategies without modifying existing code
 */
class RequestLogger {
  constructor(logger = loggerService) {
    this.logger = logger;
  }

  /**
   * Middleware function to log incoming requests
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  middleware() {
    return (req, res, next) => {
      // Assign unique request ID for tracking
      req.id = req.get('x-request-id') || uuidv4();
      
      // Record request start time for duration calculation
      req.startTime = Date.now();

      // Log incoming request
      this.logger.logRequest(req);

      // Intercept response.json and response.send to capture response data
      const originalJson = res.json;
      const originalSend = res.send;

      res.json = (data) => {
        this._captureResponse(req, res, data);
        return originalJson.call(res, data);
      };

      res.send = (data) => {
        this._captureResponse(req, res, data);
        return originalSend.call(res, data);
      };

      // Listen for response finish to log timing
      res.on('finish', () => {
        this._logResponseMetrics(req, res);
      });

      next();
    };
  }

  /**
   * Capture and store response data
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {*} data - Response data
   * @private
   */
  _captureResponse(req, res, data) {
    res.locals.responseBody = data;
  }

  /**
   * Log response metrics (status, duration, etc.)
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @private
   */
  _logResponseMetrics(req, res) {
    const duration = Date.now() - req.startTime;
    const statusCode = res.statusCode;

    this.logger.logResponse(req, res, statusCode, duration, {
      contentLength: res.get('content-length') || '0',
      contentType: res.get('content-type')
    });

    // Log slow requests (>1000ms)
    if (duration > 1000) {
      this.logger.logPerformance(`${req.method} ${req.path}`, duration, {
        threshold: 'slow',
        statusCode
      });
    }
  }
}

// Export middleware function
module.exports = new RequestLogger();
