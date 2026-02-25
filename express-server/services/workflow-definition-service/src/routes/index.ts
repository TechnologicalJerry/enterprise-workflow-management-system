import { Router } from 'express';
import * as ctrl from '../controllers/workflow-definition.controller.js';
import { correlationIdMiddleware, errorMiddleware } from '../middlewares/index.js';

const router = Router();
router.use(correlationIdMiddleware);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.post('/:id/publish', ctrl.publish);
router.post('/:id/deprecate', ctrl.deprecate);

export const routes = router;
