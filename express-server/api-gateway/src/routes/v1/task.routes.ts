// ============================================
// Task Routes - Proxy to Task Service
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

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  dueDate: z.string().datetime().optional(),
  workflowInstanceId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const taskStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'blocked']),
  comment: z.string().max(500).optional(),
});

const taskCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(2000),
  attachments: z.array(z.string().uuid()).optional(),
});

// ============================================
// Proxy handler
// ============================================

const proxyToTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1/, '');
    await proxyRequest(req, res, 'task', path);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Routes
// ============================================

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks
 *     description: Get paginated list of tasks
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled, blocked]
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get(
  '/',
  requirePermissions('tasks:read'),
  validate({ query: paginationSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create task
 *     description: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
  '/',
  requirePermissions('tasks:create'),
  validate({ body: createTaskSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks/my:
 *   get:
 *     tags: [Tasks]
 *     summary: Get my tasks
 *     description: Get tasks assigned to the current user
 *     responses:
 *       200:
 *         description: List of user's tasks
 */
router.get('/my', validate({ query: paginationSchema }), proxyToTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task
 *     description: Get task details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task details
 */
router.get(
  '/:id',
  requirePermissions('tasks:read'),
  validate({ params: uuidParamSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task
 *     description: Update an existing task
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
 *             $ref: '#/components/schemas/UpdateTask'
 *     responses:
 *       200:
 *         description: Task updated
 */
router.patch(
  '/:id',
  requirePermissions('tasks:update'),
  validate({ params: uuidParamSchema, body: updateTaskSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete task
 *     description: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete(
  '/:id',
  requirePermissions('tasks:delete'),
  validate({ params: uuidParamSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}/status:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task status
 *     description: Update the status of a task
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
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled, blocked]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task status updated
 */
router.patch(
  '/:id/status',
  requirePermissions('tasks:update'),
  validate({ params: uuidParamSchema, body: taskStatusSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}/assign:
 *   post:
 *     tags: [Tasks]
 *     summary: Assign task
 *     description: Assign a task to a user
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
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Task assigned
 */
router.post(
  '/:id/assign',
  requirePermissions('tasks:assign'),
  validate({ params: uuidParamSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}/comments:
 *   get:
 *     tags: [Tasks]
 *     summary: Get task comments
 *     description: Get comments for a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get(
  '/:id/comments',
  requirePermissions('tasks:read'),
  validate({ params: uuidParamSchema }),
  proxyToTask
);

/**
 * @swagger
 * /api/v1/tasks/{id}/comments:
 *   post:
 *     tags: [Tasks]
 *     summary: Add task comment
 *     description: Add a comment to a task
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
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post(
  '/:id/comments',
  requirePermissions('tasks:comment'),
  validate({ params: uuidParamSchema, body: taskCommentSchema }),
  proxyToTask
);

export const taskRoutes = router;
