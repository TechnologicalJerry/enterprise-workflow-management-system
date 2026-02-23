// ============================================
// Express Application - User Service
// ============================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { healthRoutes } from './routes/health.routes.js';
import { userRoutes } from './routes/user.routes.js';

export const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(correlationIdMiddleware);

  app.use('/health', healthRoutes);
  app.use('/users', userRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'Route not found' } });
  });

  app.use(errorMiddleware);
  return app;
};
