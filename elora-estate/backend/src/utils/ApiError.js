// A single, predictable error shape thrown from anywhere in the app
// (controllers, middleware, services) and turned into a JSON response
// by middleware/errorHandler.js. Keeps error handling in one place
// instead of ad-hoc res.status(...).json(...) scattered everywhere.
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details; // optional: validation field errors, etc.
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'You do not have access to this resource') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
  static internal(message = 'Something went wrong') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
