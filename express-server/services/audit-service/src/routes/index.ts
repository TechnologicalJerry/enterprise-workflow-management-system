import { Router } from 'express';
import * as ctrl from '../controllers/audit.controller.js';
import { correlationIdMiddleware, errorMiddleware } from '../middlewares/index.js';
const router = Router();
router.use(correlationIdMiddleware);
router.post('/logs', ctrl.log);
router.get('/logs', ctrl.query);
export const routes = router;
