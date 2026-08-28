import { ApiError } from '../utils/apiError.js';

// 404 for unknown routes.
export const notFoundHandler = (_req, _res, next) =>
  next(ApiError.notFound('Route not found'));

// Central error handler. Converts thrown errors into a consistent JSON shape
// and never leaks stack traces in production.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const isKnown = err.isApiError === true;
  const statusCode = isKnown ? err.statusCode : 500;
  const payload = {
    success: false,
    error: {
      message: isKnown ? err.message : 'Internal server error',
      ...(err.details ? { details: err.details } : {}),
    },
  };
  if (!isKnown && process.env.NODE_ENV !== 'test') {
    console.error('[error]', err);
  }
  res.status(statusCode).json(payload);
};
