/**
 * Error Categorizer - Single Responsibility: Categorize and classify errors
 * OCP: Easy to add new error types and categories without modifying existing code
 */
class ErrorCategorizer {
  /**
   * Categorize error type
   * @param {Error} error - Error object
   * @returns {string} Error category
   */
  static categorizeError(error) {
    if (error.statusCode === 401 || error.message?.includes('token')) {
      return 'AUTHENTICATION_ERROR';
    }
    if (error.statusCode === 403) {
      return 'AUTHORIZATION_ERROR';
    }
    if (error.statusCode === 404) {
      return 'NOT_FOUND_ERROR';
    }
    if (error.statusCode === 400 || error.statusCode === 422) {
      return 'VALIDATION_ERROR';
    }
    if (error.statusCode === 409) {
      return 'CONFLICT_ERROR';
    }
    if (error.code === 'ER_DUP_ENTRY') {
      return 'DATABASE_DUPLICATE_ERROR';
    }
    if (error.code?.startsWith('ER_')) {
      return 'DATABASE_ERROR';
    }
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      return 'TIMEOUT_ERROR';
    }
    if (error.message?.includes('ECONNREFUSED')) {
      return 'CONNECTION_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  /**
   * Determine HTTP status code for error
   * @param {Error} error - Error object
   * @param {string} category - Error category
   * @returns {number} HTTP status code
   */
  static getStatusCode(error, category) {
    const statusMap = {
      AUTHENTICATION_ERROR: 401,
      AUTHORIZATION_ERROR: 403,
      NOT_FOUND_ERROR: 404,
      VALIDATION_ERROR: 400,
      CONFLICT_ERROR: 409,
      DATABASE_DUPLICATE_ERROR: 409,
      DATABASE_ERROR: 500,
      TIMEOUT_ERROR: 504,
      CONNECTION_ERROR: 503,
      UNKNOWN_ERROR: 500
    };

    return error.statusCode || statusMap[category] || 500;
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @param {string} category - Error category
   * @returns {string} User-friendly message
   */
  static getUserMessage(error, category) {
    const messageMap = {
      AUTHENTICATION_ERROR: 'Authentication failed. Please check your credentials.',
      AUTHORIZATION_ERROR: 'You do not have permission to access this resource.',
      NOT_FOUND_ERROR: 'The requested resource was not found.',
      VALIDATION_ERROR: 'Invalid input. Please check your request.',
      CONFLICT_ERROR: 'Resource conflict. This resource may already exist.',
      DATABASE_DUPLICATE_ERROR: 'This record already exists.',
      DATABASE_ERROR: 'Database error occurred. Please try again later.',
      TIMEOUT_ERROR: 'Request timeout. Please try again.',
      CONNECTION_ERROR: 'Service temporarily unavailable. Please try again.',
      UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
    };

    return messageMap[category] || error.message;
  }

  /**
   * Determine if error is operational (expected) or programmer (unexpected)
   * @param {Error} error - Error object
   * @returns {boolean} True if operational, false if programmer error
   */
  static isOperationalError(error) {
    // Operational errors have explicit statusCode set
    if (error.statusCode) return true;

    // Known operational database errors
    const operationalDbErrors = [
      'ER_DUP_ENTRY',
      'ER_NO_REFERENCED_ROW',
      'ER_ROW_IS_REFERENCED'
    ];

    if (operationalDbErrors.includes(error.code)) return true;

    // If it's a standard HTTP error
    if (error.message && /^(ValidationError|CastError|SyntaxError|TypeError)/.test(error.name)) {
      return false; // Programmer error
    }

    return false; // Assume programmer error by default
  }
}

module.exports = ErrorCategorizer;
