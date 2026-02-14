// ============================================
// Health Check Routes
// ============================================

import { Router, Request, Response } from 'express';
import { redisClient } from '../services/redis.service.js';
import { checkServicesHealth } from '../services/proxy.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    redis: { status: 'healthy' | 'unhealthy'; latency?: number };
    services?: Record<string, { healthy: boolean; latency?: number }>;
  };
}

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Returns basic health status of the API Gateway
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
  });
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     description: Kubernetes liveness probe - returns 200 if the service is running
 *     security: []
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe
 *     description: Kubernetes readiness probe - checks if service can handle requests
 *     security: []
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    // Check Redis connection
    await redisClient.ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({ status: 'not_ready' });
  }
});

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     tags: [Health]
 *     summary: Detailed health check
 *     description: Returns detailed health status including all dependencies
 *     security: []
 *     responses:
 *       200:
 *         description: All checks passed
 *       503:
 *         description: One or more checks failed
 */
router.get('/detailed', async (_req: Request, res: Response) => {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      redis: { status: 'unhealthy' },
    },
  };

  // Check Redis
  try {
    const redisStart = Date.now();
    await redisClient.ping();
    health.checks.redis = {
      status: 'healthy',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    health.checks.redis = { status: 'unhealthy' };
    health.status = 'degraded';
  }

  // Check backend services
  try {
    health.checks.services = await checkServicesHealth();
    
    // Check if any service is unhealthy
    const unhealthyServices = Object.entries(health.checks.services).filter(
      ([_, status]) => !status.healthy
    );
    
    if (unhealthyServices.length > 0) {
      health.status = 'degraded';
    }
  } catch (error) {
    logger.error('Failed to check services health', { error });
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export const healthRoutes = router;
