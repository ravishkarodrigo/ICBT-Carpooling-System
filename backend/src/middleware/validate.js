import { ApiError } from '../utils/apiError.js';

/**
 * Validates req.body (or req.query) against a Zod schema.
 * On failure it throws a 400 ApiError with field-level details.
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(ApiError.validation('Validation failed', details));
  }
  req[source] = result.data; // use coerced / defaulted values
  next();
};
