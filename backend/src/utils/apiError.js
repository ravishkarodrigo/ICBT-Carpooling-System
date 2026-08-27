/**
 * Standardised API error class.
 * Attach a statusCode and optional extra fields,
 * then throw anywhere in the service layer — the error handler picks it up.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }

  // 400 Bad Request
  static badRequest(message = 'Bad request', details) {
    return new ApiError(400, message, details);
  }

  // 401 Unauthorized
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  // 403 Forbidden
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  // 404 Not Found
  static notFound(message = 'Not found') {
    return new ApiError(404, message);
  }

  // 409 Conflict
  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  // 422 Unprocessable Entity
  static unprocessable(message = 'Validation error', details) {
    return new ApiError(422, message, details);
  }

  // 500 Internal Server Error
  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}
