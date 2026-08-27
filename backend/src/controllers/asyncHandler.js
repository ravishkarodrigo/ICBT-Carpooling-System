/**
 * asyncHandler wraps async route handlers so uncaught promise rejections
 * are forwarded to Express's next() error handler automatically.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
