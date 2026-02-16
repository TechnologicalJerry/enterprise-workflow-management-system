// ============================================
// Server Entry Point
// ============================================

import 'dotenv/config';
import http from 'http';

import { createApp } from './app.js';
import { appConfig } from './config/app.config.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './database/prisma.js';
import { connectRedis, disconnectRedis } from './database/redis.js';

// Graceful shutdown handler
const gracefulShutdown = async (server: http.Server, signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async (err) => {
    if (err) {
      logger.error('Error during server close', { error: err.message });
      process.exit(1);
    }

    logger.info('HTTP server closed');

    try {
      await disconnectRedis();
      logger.info('Redis connection closed');

      await disconnectDatabase();
      logger.info('Database connection closed');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error });
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

const startServer = async (): Promise<void> => {
  try {
    // Create Express app
    const app = createApp();

    // Connect to database
    await connectDatabase();
    logger.info('Connected to database');

    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Create HTTP server
    const server = http.createServer(app);

    // Start listening
    server.listen(appConfig.service.port, appConfig.service.host, () => {
      logger.info(`🔐 ${appConfig.service.name} started`, {
        host: appConfig.service.host,
        port: appConfig.service.port,
        env: appConfig.env,
      });
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${appConfig.service.port} is already in use`);
      } else {
        logger.error('Server error', { error: error.message });
      }
      process.exit(1);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', { error: error.message, stack: error.stack });
      gracefulShutdown(server, 'UNCAUGHT_EXCEPTION');
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', { reason, promise });
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Start the server
startServer();
