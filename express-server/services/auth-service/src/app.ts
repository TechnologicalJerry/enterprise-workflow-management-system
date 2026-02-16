// ============================================
// Express Application Setup
// ============================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { appConfig } from './config/app.config.js';
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { healthRoutes } from './routes/health.routes.js';
import { authRoutes } from './routes/v1/auth.routes.js';

export const createApp = (): Application => {
  const app = express();

  // ============================================
  // Trust proxy
  // ============================================
  app.set('trust proxy', 1);

  // ============================================
  // Security Middleware
  // ============================================
  app.use(helmet());

  // ============================================
  // CORS
  // ============================================
  app.use(cors());

  // ============================================
  // Body Parsing
  // ============================================
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ============================================
  // Request Tracking
  // ============================================
  app.use(correlationIdMiddleware);

  // ============================================
  // Health Check Routes
  // ============================================
  app.use('/health', healthRoutes);

  // ============================================
  // API Routes
  // ============================================
  app.use('/auth', authRoutes);

  // ============================================
  // 404 Handler
  // ============================================
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ERR_1000',
        message: 'Route not found',
      },
    });
  });

  // ============================================
  // Error Handler
  // ============================================
  app.use(errorMiddleware);

  return app;
};
