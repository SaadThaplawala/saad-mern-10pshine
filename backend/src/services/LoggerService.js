const pino = require('pino');
require('dotenv').config();

/**
 * Logger Service - Single Responsibility: Handle all logging operations
 * Provides methods for different log levels and contexts
 * Follows OCP: Easy to extend with new log types without modifying existing code
 */
class LoggerService {
  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    });
  }

  /**
   * Log info level messages
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata
   */
  info(message, metadata = {}) {
    this.logger.info(metadata, message);
  }

  /**
   * Log warning level messages
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata
   */
  warn(message, metadata = {}) {
    this.logger.warn(metadata, message);
  }

  /**
   * Log error level messages
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata
   */
  error(message, metadata = {}) {
    this.logger.error(metadata, message);
  }

  /**
   * Log debug level messages
   * @param {string} message - Log message
   * @param {object} metadata - Additional metadata
   */
  debug(message, metadata = {}) {
    this.logger.debug(metadata, message);
  }

  /**
   * Log HTTP request
   * @param {object} req - Express request object
   * @param {object} metadata - Additional metadata
   */
  logRequest(req, metadata = {}) {
    const sanitizedBody = this._sanitizeBody(req.body);
    const requestLog = {
      requestId: req.id || 'N/A',
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous',
      body: sanitizedBody,
      ...metadata
    };
    this.info(`Incoming ${req.method} ${req.path}`, requestLog);
  }

  /**
   * Log HTTP response
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {number} duration - Response time in ms
   * @param {object} metadata - Additional metadata
   */
  logResponse(req, res, statusCode, duration, metadata = {}) {
    const responseLog = {
      requestId: req.id || 'N/A',
      method: req.method,
      path: req.path,
      statusCode: statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      ...metadata
    };
    
    const logLevel = statusCode >= 400 ? 'warn' : 'info';
    this.logger[logLevel](responseLog, `Response sent: ${statusCode}`);
  }

  /**
   * Log authentication event
   * @param {string} event - Auth event type (login, signup, logout)
   * @param {string} email - User email
   * @param {boolean} success - Whether event was successful
   * @param {object} metadata - Additional metadata
   */
  logAuthEvent(event, email, success, metadata = {}) {
    const authLog = {
      event,
      email,
      success,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    const logLevel = success ? 'info' : 'warn';
    this.logger[logLevel](authLog, `Auth event: ${event}`);
  }

  /**
   * Log database operation
   * @param {string} operation - DB operation type (SELECT, INSERT, UPDATE, DELETE)
   * @param {string} table - Table name
   * @param {object} metadata - Additional metadata
   */
  logDatabaseOperation(operation, table, metadata = {}) {
    const dbLog = {
      operation,
      table,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    this.debug(`Database ${operation} on ${table}`, dbLog);
  }

  /**
   * Log performance metric
   * @param {string} label - Metric label
   * @param {number} duration - Duration in ms
   * @param {object} metadata - Additional metadata
   */
  logPerformance(label, duration, metadata = {}) {
    const perfLog = {
      label,
      duration: `${duration}ms`,
      threshold: duration > 1000 ? 'slow' : 'normal',
      ...metadata
    };
    const logLevel = duration > 1000 ? 'warn' : 'debug';
    this.logger[logLevel](perfLog, `Performance: ${label}`);
  }

  /**
   * Sanitize sensitive data from logs
   * @param {object} data - Data to sanitize
   * @returns {object} Sanitized data
   * @private
   */
  _sanitizeBody(data) {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'refreshToken'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Get underlying pino logger instance for raw access
   * @returns {object} Pino logger instance
   */
  getLogger() {
    return this.logger;
  }
}

// Export singleton instance
module.exports = new LoggerService();
