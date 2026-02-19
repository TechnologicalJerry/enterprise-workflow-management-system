import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../database/prisma.js';
const router = Router();
router.get('/', (_req: Request, res: Response) => res.json({ status: 'healthy', service: 'document-service' }));
router.get('/live', (_req: Request, res: Response) => res.status(200).json({ status: 'alive' }));
router.get('/ready', async (_req: Request, res: Response) => { const ok = await checkDatabaseHealth(); res.status(ok ? 200 : 503).json({ status: ok ? 'ready' : 'not_ready' }); });
export const healthRoutes = router;
