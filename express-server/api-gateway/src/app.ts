// ============================================
// Express Application Setup
// ============================================

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { appConfig } from './config/app.config.js';
import { corsConfig } from './config/cors.config.js';
import { rateLimitConfig } from './config/rate-limit.config.js';
import { swaggerConfig, swaggerUiOptions } from './config/swagger.config.js';

// Middleware imports
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware.js';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware.js';
import { securityHeadersMiddleware } from './middlewares/security-headers.middleware.js';
import { timeoutMiddleware } from './middlewares/timeout.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';

// Routes
import { healthRoutes } from './routes/health.routes.js';
import { apiRoutes } from './routes/v1/index.js';

export const createApp = (): Application => {
  const app = express();

  // ============================================
  // Trust proxy (for rate limiting behind LB)
  // ============================================
  app.set('trust proxy', 1);

  // ============================================
  // Security Middleware
  // ============================================
  app.use(helmet());
  app.use(securityHeadersMiddleware);
  app.use(hpp()); // Prevent HTTP Parameter Pollution

  // ============================================
  // CORS
  // ============================================
  app.use(cors(corsConfig));

  // ============================================
  // Body Parsing
  // ============================================
  app.use(express.json({ limit: appConfig.request.bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: appConfig.request.bodyLimit }));

  // ============================================
  // Compression
  // ============================================
  app.use(compression());

  // ============================================
  // Request Tracking
  // ============================================
  app.use(correlationIdMiddleware);
  app.use(requestLoggerMiddleware);

  // ============================================
  // Request Timeout
  // ============================================
  app.use(timeoutMiddleware(appConfig.request.timeout));

  // ============================================
  // Rate Limiting (Global)
  // ============================================
  app.use(rateLimit(rateLimitConfig.global));

  // ============================================
  // API Documentation (non-production only)
  // ============================================
  if (!appConfig.isProduction) {
    const swaggerSpec = swaggerJsdoc(swaggerConfig);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  // ============================================
  // Health Check Routes
  // ============================================
  app.use('/health', healthRoutes);

  // ============================================
  // API Routes (v1)
  // ============================================
  app.use('/api/v1', apiRoutes);

  // ============================================
  // 404 Handler
  // ============================================
  app.use(notFoundMiddleware);

  // ============================================
  // Error Handler (must be last)
  // ============================================
  app.use(errorMiddleware);

  return app;
};
