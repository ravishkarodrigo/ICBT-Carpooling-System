/**
 * Wraps an async route handler so that any thrown error is forwarded to the
 * Express error middleware via next(err), removing try/catch boilerplate.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
