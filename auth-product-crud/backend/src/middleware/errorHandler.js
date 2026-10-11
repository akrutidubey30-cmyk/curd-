/**
 * Custom AppError class for operational errors with HTTP status codes
 */
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Centralized Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Default error response structure
  const response = {
    success: false,
    message: err.message || 'Internal server error'
  };

  // Attach structured validation errors if present
  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  // Handle specific known error types
  if (err.name === 'JsonWebTokenError') {
    response.message = 'Invalid authentication token';
    return res.status(401).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    response.message = 'Authentication token expired';
    return res.status(401).json(response);
  }

  // Never expose raw internal stack traces to the client
  res.status(statusCode).json(response);
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler
};
