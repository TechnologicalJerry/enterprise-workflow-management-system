// ============================================
// Notification Routes - Proxy to Notification Service
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { proxyRequest } from '../../services/proxy.service.js';
import { validate, uuidParamSchema, paginationSchema } from '../../middlewares/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const notificationQuerySchema = paginationSchema.extend({
  read: z.enum(['true', 'false']).optional(),
  type: z.string().optional(),
});

const updatePreferencesSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    digest: z.enum(['immediate', 'daily', 'weekly', 'never']).optional(),
  }).optional(),
  push: z.object({
    enabled: z.boolean(),
  }).optional(),
  inApp: z.object({
    enabled: z.boolean(),
  }).optional(),
  categories: z.record(z.object({
    email: z.boolean().optional(),
    push: z.boolean().optional(),
    inApp: z.boolean().optional(),
  })).optional(),
});

// ============================================
// Proxy handler
// ============================================

const proxyToNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1/, '');
    await proxyRequest(req, res, 'notification', path);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Routes
// ============================================

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications
 *     description: Get paginated list of notifications for current user
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get(
  '/',
  validate({ query: notificationQuerySchema }),
  proxyToNotification
);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread count
 *     description: Get count of unread notifications
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
router.get('/unread-count', proxyToNotification);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notification
 *     description: Get notification details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification details
 */
router.get(
  '/:id',
  validate({ params: uuidParamSchema }),
  proxyToNotification
);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark as read
 *     description: Mark a notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.post(
  '/:id/read',
  validate({ params: uuidParamSchema }),
  proxyToNotification
);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all as read
 *     description: Mark all notifications as read
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.post('/read-all', proxyToNotification);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     description: Delete a notification
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete(
  '/:id',
  validate({ params: uuidParamSchema }),
  proxyToNotification
);

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   get:
 *     tags: [Notifications]
 *     summary: Get preferences
 *     description: Get notification preferences for current user
 *     responses:
 *       200:
 *         description: Notification preferences
 */
router.get('/preferences', proxyToNotification);

/**
 * @swagger
 * /api/v1/notifications/preferences:
 *   put:
 *     tags: [Notifications]
 *     summary: Update preferences
 *     description: Update notification preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationPreferences'
 *     responses:
 *       200:
 *         description: Preferences updated
 */
router.put(
  '/preferences',
  validate({ body: updatePreferencesSchema }),
  proxyToNotification
);

export const notificationRoutes = router;
