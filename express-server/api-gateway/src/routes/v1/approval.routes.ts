// ============================================
// Approval Routes - Proxy to Approval Service
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

const createApprovalRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  type: z.string().min(1, 'Type is required'),
  approvers: z.array(z.object({
    userId: z.string().uuid(),
    order: z.number().int().min(0).optional(),
    required: z.boolean().default(true),
  })).min(1, 'At least one approver is required'),
  workflowInstanceId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const approvalDecisionSchema = z.object({
  decision: z.enum(['approve', 'reject', 'request_changes']),
  comment: z.string().max(1000).optional(),
  conditions: z.array(z.string()).optional(),
});

const delegateApprovalSchema = z.object({
  delegateToUserId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

// ============================================
// Proxy handler
// ============================================

const proxyToApproval = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1/, '');
    await proxyRequest(req, res, 'approval', path);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Routes
// ============================================

/**
 * @swagger
 * /api/v1/approvals:
 *   get:
 *     tags: [Approvals]
 *     summary: List approval requests
 *     description: Get paginated list of approval requests
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of approval requests
 */
router.get(
  '/',
  requirePermissions('approvals:read'),
  validate({ query: paginationSchema }),
  proxyToApproval
);

/**
 * @swagger
 * /api/v1/approvals:
 *   post:
 *     tags: [Approvals]
 *     summary: Create approval request
 *     description: Create a new approval request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApprovalRequest'
 *     responses:
 *       201:
 *         description: Approval request created
 */
router.post(
  '/',
  requirePermissions('approvals:create'),
  validate({ body: createApprovalRequestSchema }),
  proxyToApproval
);

/**
 * @swagger
 * /api/v1/approvals/pending:
 *   get:
 *     tags: [Approvals]
 *     summary: Get pending approvals
 *     description: Get approval requests pending current user's decision
 *     responses:
 *       200:
 *         description: List of pending approvals
 */
router.get('/pending', validate({ query: paginationSchema }), proxyToApproval);

/**
 * @swagger
 * /api/v1/approvals/my-requests:
 *   get:
 *     tags: [Approvals]
 *     summary: Get my approval requests
 *     description: Get approval requests created by current user
 *     responses:
 *       200:
 *         description: List of user's approval requests
 */
router.get('/my-requests', validate({ query: paginationSchema }), proxyToApproval);

/**
 * @swagger
 * /api/v1/approvals/{id}:
 *   get:
 *     tags: [Approvals]
 *     summary: Get approval request
 *     description: Get approval request details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Approval request details
 */
router.get(
  '/:id',
  requirePermissions('approvals:read'),
  validate({ params: uuidParamSchema }),
  proxyToApproval
);

/**
 * @swagger
 * /api/v1/approvals/{id}/decide:
 *   post:
 *     tags: [Approvals]
 *     summary: Make approval decision
 *     description: Approve, reject, or request changes on an approval request
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
 *               decision:
 *                 type: string
 *                 enum: [approve, reject, request_changes]
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Decision recorded
 */
router.post(
  '/:id/decide',
  requirePermissions('approvals:decide'),
  validate({ params: uuidParamSchema, body: approvalDecisionSchema }),
  proxyToApproval
);

/**
 * @swagger
 * /api/v1/approvals/{id}/delegate:
 *   post:
 *     tags: [Approvals]
 *     summary: Delegate approval
 *     description: Delegate approval responsibility to another user
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
 *               delegateToUserId:
 *                 type: string
 *                 format: uuid
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Approval delegated
 */
router.post(
  '/:id/delegate',
  requirePermissions('approvals:delegate'),
  validate({ params: uuidParamSchema, body: delegateApprovalSchema }),
  proxyToApproval
);

/**
 * @swagger
 * /api/v1/approvals/{id}/cancel:
 *   post:
 *     tags: [Approvals]
 *     summary: Cancel approval request
 *     description: Cancel a pending approval request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Approval request cancelled
 */
router.post(
  '/:id/cancel',
  requirePermissions('approvals:cancel'),
  validate({ params: uuidParamSchema }),
  proxyToApproval
);

/**
 * @swagger
 * /api/v1/approvals/{id}/remind:
 *   post:
 *     tags: [Approvals]
 *     summary: Send reminder
 *     description: Send reminder to pending approvers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reminder sent
 */
router.post(
  '/:id/remind',
  requirePermissions('approvals:remind'),
  validate({ params: uuidParamSchema }),
  proxyToApproval
);

/**
 * @swagger
 * /api/v1/approvals/{id}/history:
 *   get:
 *     tags: [Approvals]
 *     summary: Get approval history
 *     description: Get history of all decisions for an approval request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Approval history
 */
router.get(
  '/:id/history',
  requirePermissions('approvals:read'),
  validate({ params: uuidParamSchema }),
  proxyToApproval
);

export const approvalRoutes = router;
