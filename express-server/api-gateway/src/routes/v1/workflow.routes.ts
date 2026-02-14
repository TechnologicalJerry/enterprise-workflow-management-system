// ============================================
// Workflow Routes - Proxy to Workflow Services
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { proxyRequest } from '../../services/proxy.service.js';
import { requirePermissions } from '../../middlewares/authorization.middleware.js';
import { validate, uuidParamSchema, paginationSchema } from '../../middlewares/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const createWorkflowDefinitionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.string().optional(),
  version: z.string().default('1.0.0'),
  steps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['approval', 'task', 'notification', 'condition', 'parallel']),
    config: z.record(z.unknown()).optional(),
    transitions: z.array(z.object({
      target: z.string(),
      condition: z.string().optional(),
    })).optional(),
  })).min(1, 'At least one step is required'),
  metadata: z.record(z.unknown()).optional(),
});

const startWorkflowSchema = z.object({
  definitionId: z.string().uuid('Invalid workflow definition ID'),
  name: z.string().min(1, 'Name is required').max(100),
  context: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  dueDate: z.string().datetime().optional(),
});

const transitionWorkflowSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  comment: z.string().max(500).optional(),
  data: z.record(z.unknown()).optional(),
});

// ============================================
// Proxy handlers
// ============================================

const proxyToDefinition = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1\/workflows/, '');
    await proxyRequest(req, res, 'workflowDefinition', `/definitions${path}`);
  } catch (error) {
    next(error);
  }
};

const proxyToInstance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1\/workflows/, '');
    await proxyRequest(req, res, 'workflowInstance', `/instances${path}`);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Workflow Definition Routes
// ============================================

/**
 * @swagger
 * /api/v1/workflows/definitions:
 *   get:
 *     tags: [Workflows]
 *     summary: List workflow definitions
 *     description: Get paginated list of workflow definitions
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, deprecated]
 *     responses:
 *       200:
 *         description: List of workflow definitions
 */
router.get(
  '/definitions',
  requirePermissions('workflows:read'),
  validate({ query: paginationSchema }),
  proxyToDefinition
);

/**
 * @swagger
 * /api/v1/workflows/definitions:
 *   post:
 *     tags: [Workflows]
 *     summary: Create workflow definition
 *     description: Create a new workflow definition
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkflowDefinition'
 *     responses:
 *       201:
 *         description: Workflow definition created
 */
router.post(
  '/definitions',
  requirePermissions('workflows:create'),
  validate({ body: createWorkflowDefinitionSchema }),
  proxyToDefinition
);

/**
 * @swagger
 * /api/v1/workflows/definitions/{id}:
 *   get:
 *     tags: [Workflows]
 *     summary: Get workflow definition
 *     description: Get workflow definition by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workflow definition details
 */
router.get(
  '/definitions/:id',
  requirePermissions('workflows:read'),
  validate({ params: uuidParamSchema }),
  proxyToDefinition
);

/**
 * @swagger
 * /api/v1/workflows/definitions/{id}:
 *   put:
 *     tags: [Workflows]
 *     summary: Update workflow definition
 *     description: Update an existing workflow definition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workflow definition updated
 */
router.put(
  '/definitions/:id',
  requirePermissions('workflows:update'),
  validate({ params: uuidParamSchema }),
  proxyToDefinition
);

/**
 * @swagger
 * /api/v1/workflows/definitions/{id}/publish:
 *   post:
 *     tags: [Workflows]
 *     summary: Publish workflow definition
 *     description: Publish a draft workflow definition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workflow definition published
 */
router.post(
  '/definitions/:id/publish',
  requirePermissions('workflows:publish'),
  validate({ params: uuidParamSchema }),
  proxyToDefinition
);

/**
 * @swagger
 * /api/v1/workflows/definitions/{id}/deprecate:
 *   post:
 *     tags: [Workflows]
 *     summary: Deprecate workflow definition
 *     description: Deprecate an active workflow definition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workflow definition deprecated
 */
router.post(
  '/definitions/:id/deprecate',
  requirePermissions('workflows:update'),
  validate({ params: uuidParamSchema }),
  proxyToDefinition
);

// ============================================
// Workflow Instance Routes
// ============================================

/**
 * @swagger
 * /api/v1/workflows/instances:
 *   get:
 *     tags: [Workflows]
 *     summary: List workflow instances
 *     description: Get paginated list of workflow instances
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed, cancelled]
 *       - in: query
 *         name: definitionId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of workflow instances
 */
router.get(
  '/instances',
  requirePermissions('workflows:read'),
  validate({ query: paginationSchema }),
  proxyToInstance
);

/**
 * @swagger
 * /api/v1/workflows/instances:
 *   post:
 *     tags: [Workflows]
 *     summary: Start workflow instance
 *     description: Start a new workflow instance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartWorkflow'
 *     responses:
 *       201:
 *         description: Workflow instance started
 */
router.post(
  '/instances',
  requirePermissions('workflows:execute'),
  validate({ body: startWorkflowSchema }),
  proxyToInstance
);

/**
 * @swagger
 * /api/v1/workflows/instances/{id}:
 *   get:
 *     tags: [Workflows]
 *     summary: Get workflow instance
 *     description: Get workflow instance details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workflow instance details
 */
router.get(
  '/instances/:id',
  requirePermissions('workflows:read'),
  validate({ params: uuidParamSchema }),
  proxyToInstance
);

/**
 * @swagger
 * /api/v1/workflows/instances/{id}/transition:
 *   post:
 *     tags: [Workflows]
 *     summary: Transition workflow
 *     description: Transition workflow to next state
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Workflow transitioned
 */
router.post(
  '/instances/:id/transition',
  requirePermissions('workflows:execute'),
  validate({ params: uuidParamSchema, body: transitionWorkflowSchema }),
  proxyToInstance
);

/**
 * @swagger
 * /api/v1/workflows/instances/{id}/cancel:
 *   post:
 *     tags: [Workflows]
 *     summary: Cancel workflow
 *     description: Cancel a running workflow instance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workflow cancelled
 */
router.post(
  '/instances/:id/cancel',
  requirePermissions('workflows:execute'),
  validate({ params: uuidParamSchema }),
  proxyToInstance
);

/**
 * @swagger
 * /api/v1/workflows/instances/{id}/history:
 *   get:
 *     tags: [Workflows]
 *     summary: Get workflow history
 *     description: Get execution history of a workflow instance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Workflow execution history
 */
router.get(
  '/instances/:id/history',
  requirePermissions('workflows:read'),
  validate({ params: uuidParamSchema }),
  proxyToInstance
);

export const workflowRoutes = router;
