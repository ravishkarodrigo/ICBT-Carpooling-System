import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import router from './routes/index.js';
import { ApiError } from './utils/apiError.js';
import { apiLimiter } from './middleware/rateLimit.js';

/**
 * Factory that creates and configures the Express app.
 * Keeping app creation separate from server.listen() makes the app
 * importable in tests (via supertest) without binding to a port.
 */
export function createApp() {
  const app = express();

  // ─── Global Middleware ──────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json());
  app.use(apiLimiter);

  // ─── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api', router);

  // ─── 404 Handler ────────────────────────────────────────────────────────────
  app.use((_req, _res, next) => {
    next(ApiError.notFound('Route not found'));
  });

  // ─── Global Error Handler ────────────────────────────────────────────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.isApiError) {
      return res.status(err.statusCode).json({
        success: false,
        error: {
          message: err.message,
          ...(err.details && { details: err.details }),
        },
      });
    }

    console.error('[app] Unhandled error:', err);
    res.status(500).json({ success: false, error: { message: 'Internal server error' } });
  });

  return app;
}
