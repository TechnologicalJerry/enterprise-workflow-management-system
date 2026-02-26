// ============================================
// User API Contract v1
// ============================================

import { z } from 'zod';
import { BasicEmailSchema } from '../../../validators/email.validator.js';
import { UUIDv4Schema } from '../../../validators/uuid.validator.js';
import { PaginationQuerySchema } from '../../../dto/pagination.dto.js';
import { ROLES } from '../../../constants/permissions.constants.js';

const RoleSchema = z.enum([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.SUPERVISOR,
  ROLES.USER,
  ROLES.VIEWER,
  ROLES.EXTERNAL,
]);

const UserStatusSchema = z.enum(['active', 'inactive', 'pending', 'locked', 'suspended']);

/**
 * Create user request schema
 */
export const CreateUserRequestSchema = z.object({
  email: BasicEmailSchema,
  password: z.string().min(12).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  roles: z.array(RoleSchema).optional().default([ROLES.USER]),
  department: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  managerId: UUIDv4Schema.optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

/**
 * Update user request schema
 */
export const UpdateUserRequestSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  managerId: UUIDv4Schema.optional().nullable(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    language: z.string().optional(),
    timezone: z.string().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  }).optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

/**
 * User query parameters schema
 */
export const UserQuerySchema = PaginationQuerySchema.extend({
  status: z.union([UserStatusSchema, z.array(UserStatusSchema)]).optional(),
  roles: z.union([RoleSchema, z.array(RoleSchema)]).optional(),
  department: z.string().optional(),
  search: z.string().optional(),
});

export type UserQuery = z.infer<typeof UserQuerySchema>;

/**
 * Update user roles schema
 */
export const UpdateUserRolesSchema = z.object({
  roles: z.array(RoleSchema).min(1, 'At least one role is required'),
});

export type UpdateUserRoles = z.infer<typeof UpdateUserRolesSchema>;

/**
 * Update user status schema
 */
export const UpdateUserStatusSchema = z.object({
  status: UserStatusSchema,
  reason: z.string().max(500).optional(),
});

export type UpdateUserStatus = z.infer<typeof UpdateUserStatusSchema>;

/**
 * User response schema
 */
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  avatar: z.string().optional(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  roles: z.array(RoleSchema),
  status: UserStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
