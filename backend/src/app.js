import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { ApiError } from './utils/apiError.js';
import { apiLimiter } from './middleware/rateLimit.js';

import authRoutes from './routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

export const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json());
app.use(apiLimiter);

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, _res, next) => next(ApiError.notFound('Route not found')));

// ── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Unexpected / unhandled errors — don't leak internals
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
});
