import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { correlationIdMiddleware, errorMiddleware } from './middlewares/index.js';
import { healthRoutes } from './routes/health.routes.js';
import { routes } from './routes/index.js';
export const createApp = (): Application => {
  const app = express();
  app.use(helmet()); app.use(cors()); app.use(express.json());
  app.use(correlationIdMiddleware);
  app.use('/health', healthRoutes);
  app.use('/reports', routes);
  app.use((_req, res) => res.status(404).json({ success: false, error: { code: 'ERR_1002', message: 'Not found' } }));
  app.use(errorMiddleware);
  return app;
};
