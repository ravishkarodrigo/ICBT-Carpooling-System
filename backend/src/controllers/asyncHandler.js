/**
 * Wraps an async route handler so that any rejected promise is forwarded
 * to Express's next(err) error-handling middleware, avoiding try/catch
 * boilerplate in every controller.
 *
 * @param {Function} fn  Async (req, res, next) => Promise
 * @returns {Function}   Standard Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
