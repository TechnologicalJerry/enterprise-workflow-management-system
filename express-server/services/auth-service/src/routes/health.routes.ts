// ============================================
// Health Check Routes
// ============================================

import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../database/prisma.js';
import { checkRedisHealth } from '../database/redis.js';
import { logger } from '../utils/logger.js';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: 'healthy' | 'unhealthy'; latency?: number };
    redis: { status: 'healthy' | 'unhealthy'; latency?: number };
  };
}

// GET /health
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
  });
});

// GET /health/live
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

// GET /health/ready
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const [dbHealthy, redisHealthy] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    if (dbHealthy && redisHealthy) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not_ready' });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({ status: 'not_ready' });
  }
});

// GET /health/detailed
router.get('/detailed', async (_req: Request, res: Response) => {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: { status: 'unhealthy' },
      redis: { status: 'unhealthy' },
    },
  };

  // Check database
  try {
    const dbStart = Date.now();
    const dbHealthy = await checkDatabaseHealth();
    health.checks.database = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      latency: Date.now() - dbStart,
    };
    if (!dbHealthy) health.status = 'degraded';
  } catch (error) {
    health.checks.database = { status: 'unhealthy' };
    health.status = 'degraded';
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    const redisHealthy = await checkRedisHealth();
    health.checks.redis = {
      status: redisHealthy ? 'healthy' : 'unhealthy',
      latency: Date.now() - redisStart,
    };
    if (!redisHealthy) health.status = 'degraded';
  } catch (error) {
    health.checks.redis = { status: 'unhealthy' };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export const healthRoutes = router;
