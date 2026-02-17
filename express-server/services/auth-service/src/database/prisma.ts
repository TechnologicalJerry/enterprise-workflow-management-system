// ============================================
// Prisma Client Singleton
// ============================================

import { PrismaClient } from '@prisma/client';
import { appConfig } from '../config/app.config.js';
import { logger } from '../utils/logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: appConfig.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });

if (!appConfig.isProduction) {
  globalForPrisma.prisma = prisma;
}

// Connection management
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
