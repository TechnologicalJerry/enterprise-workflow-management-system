// ============================================
// Role Service
// ============================================

import { roleRepository } from '../repositories/role.repository.js';
import { permissionRepository } from '../repositories/permission.repository.js';
import { userRoleRepository } from '../repositories/user-role.repository.js';
import { prisma } from '../database/prisma.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import { logger } from '../utils/logger.js';

export interface UserRolesResponse {
  userId: string;
  roles: string[];
  permissions: string[];
}

class RoleService {
  async getUserRolesAndPermissions(userId: string): Promise<UserRolesResponse> {
    const { roleNames, permissionNames } = await userRoleRepository.getUserRolesAndPermissions(userId);
    return {
      userId,
      roles: roleNames,
      permissions: permissionNames,
    };
  }

  async assignRolesToUser(userId: string, roleIds: string[]): Promise<{ roles: string[] }> {
    if (roleIds.length > 0) {
      const existing = await prisma.role.findMany({
        where: { id: { in: roleIds } },
        select: { id: true, name: true },
      });
      if (existing.length !== roleIds.length) {
        const foundIds = new Set(existing.map((r) => r.id));
        const missing = roleIds.filter((id) => !foundIds.has(id));
        throw new HttpError(
          HTTP_STATUS.BAD_REQUEST,
          `Invalid role IDs: ${missing.join(', ')}`,
          ERROR_CODES.GENERAL.BAD_REQUEST
        );
      }
    }

    await userRoleRepository.setUserRoles(userId, roleIds);
    const { roleNames } = await userRoleRepository.getUserRolesAndPermissions(userId);
    logger.info('User roles assigned', { userId, roles: roleNames });
    return { roles: roleNames };
  }

  async getRoleIdsByNames(names: string[]): Promise<string[]> {
    if (names.length === 0) return [];
    const roles = await roleRepository.findByNames(names);
    return roles.map((r) => r.id);
  }

  async listRoles(): Promise<any[]> {
    return roleRepository.list();
  }

  async getRoleById(id: string): Promise<any> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Role not found', ERROR_CODES.AUTHORIZATION.ROLE_NOT_FOUND);
    }
    return role;
  }

  async createRole(data: { name: string; description?: string; permissionIds?: string[] }): Promise<any> {
    const existing = await roleRepository.findByName(data.name);
    if (existing) {
      throw new HttpError(HTTP_STATUS.CONFLICT, 'Role name already exists', ERROR_CODES.GENERAL.CONFLICT);
    }

    const role = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: data.name,
          description: data.description,
          isSystem: false,
        },
      });
      if (data.permissionIds && data.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
          skipDuplicates: true,
        });
      }
      return tx.role.findUnique({
        where: { id: role.id },
        include: { rolePermissions: { include: { permission: true } } },
      });
    });

    logger.info('Role created', { roleId: role!.id, name: role!.name });
    return role;
  }

  async updateRole(id: string, data: { name?: string; description?: string }): Promise<any> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Role not found', ERROR_CODES.AUTHORIZATION.ROLE_NOT_FOUND);
    }
    if (role.isSystem && data.name && data.name !== role.name) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Cannot rename system role', ERROR_CODES.GENERAL.BAD_REQUEST);
    }
    return roleRepository.update(id, data).then(() => roleRepository.findById(id));
  }

  async deleteRole(id: string): Promise<void> {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Role not found', ERROR_CODES.AUTHORIZATION.ROLE_NOT_FOUND);
    }
    if (role.isSystem) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Cannot delete system role', ERROR_CODES.GENERAL.BAD_REQUEST);
    }
    await roleRepository.delete(id);
    logger.info('Role deleted', { roleId: id });
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<any> {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'Role not found', ERROR_CODES.AUTHORIZATION.ROLE_NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
          skipDuplicates: true,
        });
      }
    });

    return roleRepository.findById(roleId);
  }
}

export const roleService = new RoleService();
