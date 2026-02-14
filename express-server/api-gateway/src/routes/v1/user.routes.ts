// ============================================
// User Routes - Proxy to User Service
// ============================================

import { Router, Request, Response, NextFunction } from 'express';
import { proxyRequest } from '../../services/proxy.service.js';
import { requireRoles, requirePermissions, requireOwnerOrAdmin } from '../../middlewares/authorization.middleware.js';
import { validate, uuidParamSchema, paginationSchema } from '../../middlewares/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  roles: z.array(z.string()).optional(),
  departmentId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateUserRolesSchema = z.object({
  roles: z.array(z.string()).min(1, 'At least one role is required'),
});

// ============================================
// Proxy handler
// ============================================

const proxyToUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const path = req.originalUrl.replace(/^\/api\/v1/, '');
    await proxyRequest(req, res, 'user', path);
  } catch (error) {
    next(error);
  }
};

// ============================================
// Routes
// ============================================

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List users
 *     description: Get paginated list of users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get(
  '/',
  requirePermissions('user:read'),
  validate({ query: paginationSchema }),
  proxyToUser
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: Create user
 *     description: Create a new user (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Email already exists
 */
router.post(
  '/',
  requireRoles('super_admin', 'admin'),
  validate({ body: createUserSchema }),
  proxyToUser
);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 *     description: Get the authenticated user's profile
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/me', proxyToUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user
 *     description: Update the authenticated user's profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch('/me', validate({ body: updateUserSchema }), proxyToUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Get a specific user's details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  requirePermissions('user:read'),
  validate({ params: uuidParamSchema }),
  proxyToUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     description: Update a user's profile (admin or self)
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
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch(
  '/:id',
  validate({ params: uuidParamSchema, body: updateUserSchema }),
  requireOwnerOrAdmin((req) => req.params.id),
  proxyToUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     description: Soft delete a user (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete(
  '/:id',
  requireRoles('super_admin', 'admin'),
  validate({ params: uuidParamSchema }),
  proxyToUser
);

/**
 * @swagger
 * /api/v1/users/{id}/roles:
 *   put:
 *     tags: [Users]
 *     summary: Update user roles
 *     description: Update a user's roles (admin only)
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
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Roles updated successfully
 */
router.put(
  '/:id/roles',
  requireRoles('super_admin', 'admin'),
  validate({ params: uuidParamSchema, body: updateUserRolesSchema }),
  proxyToUser
);

/**
 * @swagger
 * /api/v1/users/{id}/activate:
 *   post:
 *     tags: [Users]
 *     summary: Activate user
 *     description: Activate a deactivated user (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User activated
 */
router.post(
  '/:id/activate',
  requireRoles('super_admin', 'admin'),
  validate({ params: uuidParamSchema }),
  proxyToUser
);

/**
 * @swagger
 * /api/v1/users/{id}/deactivate:
 *   post:
 *     tags: [Users]
 *     summary: Deactivate user
 *     description: Deactivate a user (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deactivated
 */
router.post(
  '/:id/deactivate',
  requireRoles('super_admin', 'admin'),
  validate({ params: uuidParamSchema }),
  proxyToUser
);

export const userRoutes = router;
