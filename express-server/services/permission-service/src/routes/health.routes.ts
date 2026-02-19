import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'permission-service' });
});

router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const ok = await checkDatabaseHealth();
    res.status(ok ? 200 : 503).json({ status: ok ? 'ready' : 'not_ready' });
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({ status: 'not_ready' });
  }
});

router.get('/detailed', async (_req: Request, res: Response) => {
  const dbOk = await checkDatabaseHealth().catch(() => false);
  const status = dbOk ? 'healthy' : 'degraded';
  res.status(dbOk ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: { database: { status: dbOk ? 'healthy' : 'unhealthy' } },
  });
});

export const healthRoutes = router;
