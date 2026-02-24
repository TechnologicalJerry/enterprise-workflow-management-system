// ============================================
// User Service
// ============================================

import { User, UserStatus } from '@prisma/client';
import { userRepository, ListUsersOptions, ListUsersResult } from '../repositories/user.repository.js';
import { departmentRepository } from '../repositories/department.repository.js';
import { permissionClient } from './permission-client.service.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import { logger } from '../utils/logger.js';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId?: string;
  roles?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  timezone?: string;
  locale?: string;
  departmentId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface UserWithRoles {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  phone?: string | null;
  avatar?: string | null;
  timezone?: string | null;
  locale?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  metadata?: unknown;
  roles?: string[];
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  async getById(id: string, includeRoles = false, correlationId?: string): Promise<UserWithRoles | null> {
    const user = await userRepository.findById(id);
    if (!user) return null;

    const base = this.toUserWithRoles(user);
    if (includeRoles) {
      const { roles, permissions } = await permissionClient.getUserRolesAndPermissions(id, correlationId);
      base.roles = roles;
      base.permissions = permissions;
    }
    return base;
  }

  async getByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  }

  async getMe(userId: string, correlationId?: string): Promise<UserWithRoles> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'User not found', ERROR_CODES.USER.NOT_FOUND);
    }
    const result = await this.getById(userId, true, correlationId);
    return result!;
  }

  async list(
    options: ListUsersOptions,
    correlationId?: string
  ): Promise<ListUsersResult & { users: UserWithRoles[] }> {
    const result = await userRepository.list(options);
    const users: UserWithRoles[] = result.users.map((u) => this.toUserWithRoles(u));

    if (options.role) {
      const filtered: UserWithRoles[] = [];
      for (const u of users) {
        const { roles } = await permissionClient.getUserRolesAndPermissions(u.id, correlationId);
        if (roles.includes(options.role)) {
          u.roles = roles;
          filtered.push(u);
        }
      }
      return {
        ...result,
        users: filtered,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / (options.limit ?? 20)),
      };
    }

    return { ...result, users };
  }

  async create(dto: CreateUserDto, correlationId?: string): Promise<UserWithRoles> {
    const email = dto.email.toLowerCase();
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(HTTP_STATUS.CONFLICT, 'Email already exists', ERROR_CODES.USER.ALREADY_EXISTS);
    }

    if (dto.departmentId) {
      const dept = await departmentRepository.findById(dto.departmentId);
      if (!dept) {
        throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Invalid department', ERROR_CODES.GENERAL.BAD_REQUEST);
      }
    }

    const user = await userRepository.create({
      email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      departmentId: dto.departmentId,
      metadata: (dto.metadata ?? {}) as object,
    });

    if (dto.roles && dto.roles.length > 0) {
      const roleIds = await permissionClient.getRoleIdsByNames(dto.roles, correlationId);
      if (roleIds.length > 0) {
        await permissionClient.assignRolesToUser(user.id, roleIds, correlationId);
      }
    }

    logger.info('User created', { userId: user.id, email: user.email, correlationId });
    return this.getById(user.id, true, correlationId) as Promise<UserWithRoles>;
  }

  async update(id: string, dto: UpdateUserDto, correlationId?: string): Promise<UserWithRoles> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'User not found', ERROR_CODES.USER.NOT_FOUND);
    }

    if (dto.departmentId !== undefined && dto.departmentId !== null) {
      const dept = await departmentRepository.findById(dto.departmentId);
      if (!dept) {
        throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'Invalid department', ERROR_CODES.GENERAL.BAD_REQUEST);
      }
    }

    const user = await userRepository.update(id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      avatar: dto.avatar,
      timezone: dto.timezone,
      locale: dto.locale,
      departmentId: dto.departmentId,
      metadata: dto.metadata as object | undefined,
    });

    logger.info('User updated', { userId: id, correlationId });
    return this.getById(user.id, true, correlationId) as Promise<UserWithRoles>;
  }

  async delete(id: string, correlationId?: string): Promise<void> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'User not found', ERROR_CODES.USER.NOT_FOUND);
    }

    await userRepository.softDelete(id);
    logger.info('User soft-deleted', { userId: id, correlationId });
  }

  async updateRoles(id: string, roleNames: string[], correlationId?: string): Promise<UserWithRoles> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'User not found', ERROR_CODES.USER.NOT_FOUND);
    }

    const roleIds = await permissionClient.getRoleIdsByNames(roleNames, correlationId);
    if (roleIds.length === 0 && roleNames.length > 0) {
      throw new HttpError(HTTP_STATUS.BAD_REQUEST, 'No valid roles found', ERROR_CODES.GENERAL.BAD_REQUEST);
    }

    await permissionClient.assignRolesToUser(id, roleIds, correlationId);
    logger.info('User roles updated', { userId: id, roles: roleNames, correlationId });
    return this.getById(id, true, correlationId) as Promise<UserWithRoles>;
  }

  async activate(id: string, correlationId?: string): Promise<UserWithRoles> {
    return this.setStatus(id, 'ACTIVE', correlationId);
  }

  async deactivate(id: string, correlationId?: string): Promise<UserWithRoles> {
    return this.setStatus(id, 'INACTIVE', correlationId);
  }

  private async setStatus(
    id: string,
    status: UserStatus,
    correlationId?: string
  ): Promise<UserWithRoles> {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new HttpError(HTTP_STATUS.NOT_FOUND, 'User not found', ERROR_CODES.USER.NOT_FOUND);
    }

    await userRepository.update(id, { status });
    logger.info('User status updated', { userId: id, status, correlationId });
    return this.getById(id, true, correlationId) as Promise<UserWithRoles>;
  }

  private toUserWithRoles(user: User & { department?: { id: string; name: string; code: string } | null }): UserWithRoles {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      phone: user.phone,
      avatar: user.avatar,
      timezone: user.timezone,
      locale: user.locale,
      departmentId: user.departmentId,
      department: user.department ?? undefined,
      metadata: user.metadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const userService = new UserService();
