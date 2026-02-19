// ============================================
// Role & User-Role Controller
// ============================================

import { Request, Response, NextFunction } from 'express';
import { roleService } from '../services/role.service.js';
import { permissionService } from '../services/permission.service.js';
import { HTTP_STATUS } from '@workflow/shared';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

// GET /users/:userId/roles
export async function getUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const data = await roleService.getUserRolesAndPermissions(userId);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// PUT /users/:userId/roles
export async function assignUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const { roleIds } = req.body as { roleIds: string[] };
    const data = await roleService.assignRolesToUser(userId, roleIds || []);
    res.status(HTTP_STATUS.OK).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// POST /roles/by-names
export async function getRoleIdsByNames(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { names } = req.body as { names: string[] };
    const roleIds = await roleService.getRoleIdsByNames(names || []);
    res.status(HTTP_STATUS.OK).json({ success: true, roleIds });
  } catch (error) {
    next(error);
  }
}

// GET /roles
export async function listRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roles = await roleService.listRoles();
    res.status(HTTP_STATUS.OK).json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
}

// GET /roles/:id
export async function getRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

// POST /roles
export async function createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = await roleService.createRole(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

// PATCH /roles/:id
export async function updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const role = await roleService.updateRole(id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

// DELETE /roles/:id
export async function deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await roleService.deleteRole(id);
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Role deleted' });
  } catch (error) {
    next(error);
  }
}

// PUT /roles/:id/permissions
export async function setRolePermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body as { permissionIds: string[] };
    const role = await roleService.setRolePermissions(id, permissionIds || []);
    res.status(HTTP_STATUS.OK).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

// GET /permissions
export async function listPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resource = req.query.resource as string | undefined;
    const permissions = await permissionService.list(resource);
    res.status(HTTP_STATUS.OK).json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
}

// GET /permissions/:id
export async function getPermissionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const permission = await permissionService.getById(id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: permission });
  } catch (error) {
    next(error);
  }
}

// POST /permissions
export async function createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const permission = await permissionService.create(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: permission });
  } catch (error) {
    next(error);
  }
}

// PATCH /permissions/:id
export async function updatePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const permission = await permissionService.update(id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: permission });
  } catch (error) {
    next(error);
  }
}

// DELETE /permissions/:id
export async function deletePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await permissionService.delete(id);
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Permission deleted' });
  } catch (error) {
    next(error);
  }
}
