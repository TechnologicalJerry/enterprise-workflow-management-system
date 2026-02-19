// ============================================
// Role & Permission Routes
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import * as roleController from '../controllers/role.controller.js';
import { validate } from '../middlewares/validation.middleware.js';

const router = Router();

const userIdParamSchema = z.object({ userId: z.string().min(1) });
const roleIdParamSchema = z.object({ id: z.string().uuid() });
const permIdParamSchema = z.object({ id: z.string().uuid() });

const putUserRolesSchema = z.object({ roleIds: z.array(z.string().uuid()) });
const postRolesByNamesSchema = z.object({ names: z.array(z.string().min(1)) });
const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
});
const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});
const setRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});
const createPermissionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  resource: z.string().min(1).max(50),
  action: z.string().min(1).max(50),
});
const updatePermissionSchema = z.object({
  description: z.string().max(500).optional(),
});

// User roles (used by auth-service and user-service)
router.get('/users/:userId/roles', validate({ params: userIdParamSchema }), roleController.getUserRoles);
router.put('/users/:userId/roles', validate({ params: userIdParamSchema, body: putUserRolesSchema }), roleController.assignUserRoles);

// Resolve role names to IDs (used by user-service)
router.post('/roles/by-names', validate({ body: postRolesByNamesSchema }), roleController.getRoleIdsByNames);

// Role CRUD
router.get('/roles', roleController.listRoles);
router.get('/roles/:id', validate({ params: roleIdParamSchema }), roleController.getRoleById);
router.post('/roles', validate({ body: createRoleSchema }), roleController.createRole);
router.patch('/roles/:id', validate({ params: roleIdParamSchema, body: updateRoleSchema }), roleController.updateRole);
router.delete('/roles/:id', validate({ params: roleIdParamSchema }), roleController.deleteRole);
router.put('/roles/:id/permissions', validate({ params: roleIdParamSchema, body: setRolePermissionsSchema }), roleController.setRolePermissions);

// Permission CRUD
router.get('/permissions', roleController.listPermissions);
router.get('/permissions/:id', validate({ params: permIdParamSchema }), roleController.getPermissionById);
router.post('/permissions', validate({ body: createPermissionSchema }), roleController.createPermission);
router.patch('/permissions/:id', validate({ params: permIdParamSchema, body: updatePermissionSchema }), roleController.updatePermission);
router.delete('/permissions/:id', validate({ params: permIdParamSchema }), roleController.deletePermission);

export const roleRoutes = router;
