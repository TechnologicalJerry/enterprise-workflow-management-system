// ============================================
// Reporting Routes - Proxy to Reporting Service
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { proxyRequest } from '../../services/proxy.service.js';
import { requirePermissions, requireRoles } from '../../middlewares/authorization.middleware.js';
import { validate, uuidParamSchema } from '../../middlewares/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
});

const generateReportSchema = z.object({
  type: z.enum([
    'workflow_summary',
    'task_analytics',
    'approval_metrics',
    'user_activity',
    'performance',
    'compliance',
    'custom',
  ]),
  filters: z.record(z.unknown()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['json', 'csv', 'pdf', 'excel']).default('json'),
  schedule: z.object({
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly']),
    recipients: z.array(z.string().email()).optional(),
  }).optional(),
});

const dashboardWidgetSchema = z.object({
  type: z.enum([
    'counter',
    'chart',
    'table',
    'gauge',
    'progress',
  ]),
  title: z.string().min(1).max(100),
  query: z.string(),
  config: z.record(z.unknown()).optional(),
});

// ============================================
// Proxy handler
// ============================================

const proxyToReporting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1/, '');
    await proxyRequest(req, res, 'reporting', path);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Dashboard Routes
// ============================================

/**
 * @swagger
 * /api/v1/reports/dashboard:
 *   get:
 *     tags: [Reports]
 *     summary: Get dashboard data
 *     description: Get dashboard summary with key metrics
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get(
  '/dashboard',
  requirePermissions('reports:read'),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/dashboard/widgets:
 *   get:
 *     tags: [Reports]
 *     summary: Get dashboard widgets
 *     description: Get configured dashboard widgets
 *     responses:
 *       200:
 *         description: Dashboard widgets
 */
router.get(
  '/dashboard/widgets',
  requirePermissions('reports:read'),
  proxyToReporting
);

// ============================================
// Analytics Routes
// ============================================

/**
 * @swagger
 * /api/v1/reports/workflows/analytics:
 *   get:
 *     tags: [Reports]
 *     summary: Workflow analytics
 *     description: Get workflow execution analytics
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Workflow analytics data
 */
router.get(
  '/workflows/analytics',
  requirePermissions('reports:read'),
  validate({ query: dateRangeSchema }),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/tasks/analytics:
 *   get:
 *     tags: [Reports]
 *     summary: Task analytics
 *     description: Get task completion and performance analytics
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Task analytics data
 */
router.get(
  '/tasks/analytics',
  requirePermissions('reports:read'),
  validate({ query: dateRangeSchema }),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/approvals/analytics:
 *   get:
 *     tags: [Reports]
 *     summary: Approval analytics
 *     description: Get approval processing analytics
 *     responses:
 *       200:
 *         description: Approval analytics data
 */
router.get(
  '/approvals/analytics',
  requirePermissions('reports:read'),
  validate({ query: dateRangeSchema }),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/users/activity:
 *   get:
 *     tags: [Reports]
 *     summary: User activity report
 *     description: Get user activity and engagement report
 *     responses:
 *       200:
 *         description: User activity data
 */
router.get(
  '/users/activity',
  requirePermissions('reports:read'),
  validate({ query: dateRangeSchema }),
  proxyToReporting
);

// ============================================
// Report Generation Routes
// ============================================

/**
 * @swagger
 * /api/v1/reports/generate:
 *   post:
 *     tags: [Reports]
 *     summary: Generate report
 *     description: Generate a custom report
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateReport'
 *     responses:
 *       202:
 *         description: Report generation started
 */
router.post(
  '/generate',
  requirePermissions('reports:generate'),
  validate({ body: generateReportSchema }),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/{id}:
 *   get:
 *     tags: [Reports]
 *     summary: Get report
 *     description: Get generated report by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Report data
 */
router.get(
  '/:id',
  requirePermissions('reports:read'),
  validate({ params: uuidParamSchema }),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/{id}/download:
 *   get:
 *     tags: [Reports]
 *     summary: Download report
 *     description: Download generated report file
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Report file
 */
router.get(
  '/:id/download',
  requirePermissions('reports:read'),
  validate({ params: uuidParamSchema }),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/scheduled:
 *   get:
 *     tags: [Reports]
 *     summary: Get scheduled reports
 *     description: Get list of scheduled reports
 *     responses:
 *       200:
 *         description: Scheduled reports list
 */
router.get(
  '/scheduled',
  requirePermissions('reports:read'),
  proxyToReporting
);

/**
 * @swagger
 * /api/v1/reports/scheduled/{id}:
 *   delete:
 *     tags: [Reports]
 *     summary: Cancel scheduled report
 *     description: Cancel a scheduled report
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Scheduled report cancelled
 */
router.delete(
  '/scheduled/:id',
  requirePermissions('reports:delete'),
  validate({ params: uuidParamSchema }),
  proxyToReporting
);

export const reportingRoutes = router;
