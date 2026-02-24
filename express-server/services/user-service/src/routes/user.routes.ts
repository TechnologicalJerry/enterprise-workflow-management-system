// ============================================
// User Routes
// ============================================

import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { z } from 'zod';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().max(20).optional(),
  departmentId: z.string().uuid().optional(),
  roles: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  departmentId: z.string().uuid().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

const updateRolesSchema = z.object({
  roles: z.array(z.string()).min(1),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  departmentId: z.string().uuid().optional(),
  role: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  includeRoles: z.enum(['true', 'false']).optional(),
});

const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

// List users
router.get('/', validate({ query: listQuerySchema }), userController.list);

// Create user
router.post('/', validate({ body: createUserSchema }), userController.create);

// Current user (me) - gateway forwards X-User-Id
router.get('/me', userController.getMe);
router.patch('/me', validate({ body: updateUserSchema }), userController.updateMe);

// By id
router.get('/:id', validate({ params: uuidParamSchema }), userController.getById);
router.patch('/:id', validate({ params: uuidParamSchema, body: updateUserSchema }), userController.update);
router.delete('/:id', validate({ params: uuidParamSchema }), userController.delete);

// Roles (delegates to permission-service via permissionClient)
router.put('/:id/roles', validate({ params: uuidParamSchema, body: updateRolesSchema }), userController.updateRoles);

// Status
router.post('/:id/activate', validate({ params: uuidParamSchema }), userController.activate);
router.post('/:id/deactivate', validate({ params: uuidParamSchema }), userController.deactivate);

export const userRoutes = router;
