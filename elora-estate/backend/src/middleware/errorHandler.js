const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Must be registered LAST (after all routes) — Express identifies error
// middleware by its 4-argument signature.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  // Translate common non-ApiError failures into a sane HTTP response
  // instead of leaking a raw 500 + stack trace shape to the client.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.fromEntries(
      Object.entries(err.errors || {}).map(([field, e]) => [field, e.message])
    );
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for "${err.path}"`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate value';
  }

  if (!statusCode) statusCode = 500;
  if (!message) message = 'Internal server error';

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  const body = { error: { message } };
  if (details) body.error.details = details;
  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

module.exports = { notFoundHandler, errorHandler };
