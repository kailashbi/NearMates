import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err.stack || err.message);

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: err.details.map(d => d.message).join(', ')
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    statusCode,
    error: err.name || 'Error',
    message
  });
}

