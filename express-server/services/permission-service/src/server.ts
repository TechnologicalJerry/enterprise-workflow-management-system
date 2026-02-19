// ============================================
// Permission Service - Server Entry Point
// ============================================

import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';
import { appConfig } from './config/app.config.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.js';

const gracefulShutdown = async (server: http.Server, signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  server.close(async (err) => {
    if (err) {
      logger.error('Error during server close', { error: err.message });
      process.exit(1);
    }
    try {
      await disconnectDatabase();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error });
      process.exit(1);
    }
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

const startServer = async (): Promise<void> => {
  try {
    const app = createApp();
    await connectDatabase();

    const server = http.createServer(app);
    server.listen(appConfig.service.port, appConfig.service.host, () => {
      logger.info(`${appConfig.service.name} started`, {
        host: appConfig.service.host,
        port: appConfig.service.port,
        env: appConfig.env,
      });
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${appConfig.service.port} is already in use`);
      } else {
        logger.error('Server error', { error: error.message });
      }
      process.exit(1);
    });

    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      gracefulShutdown(server, 'UNCAUGHT_EXCEPTION');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();
