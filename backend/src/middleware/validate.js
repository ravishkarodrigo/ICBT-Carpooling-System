import { ApiError } from '../utils/apiError.js';

/**
 * Zod validation middleware.
 * @param {ZodSchema} schema - The Zod schema to validate against.
 * @param {'body'|'query'|'params'} source - Where to read input from. Defaults to 'body'.
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest('Validation failed', details));
    }
    // Replace the source with the parsed (and default-filled) data
    req[source] = result.data;
    next();
  };
}
