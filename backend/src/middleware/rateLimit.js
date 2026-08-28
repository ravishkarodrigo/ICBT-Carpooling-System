import rateLimit from 'express-rate-limit';

// No-op middleware used in test environment to avoid throttling test suites.
const passThrough = (_req, _res, next) => next();

// Tighter limit on auth endpoints to slow credential-stuffing / brute force.
export const authLimiter = process.env.NODE_ENV === 'test'
  ? passThrough
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: { message: 'Too many attempts, try again later' } },
    });

export const apiLimiter = process.env.NODE_ENV === 'test'
  ? passThrough
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    });
