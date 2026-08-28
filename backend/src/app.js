import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

// Builds the Express app. Kept separate from server.js so tests can import it
// without opening a port.
export function createApp() {
  const app = express();

  app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "ICBT Carpooling API is running"
  });
});

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiLimiter);

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
