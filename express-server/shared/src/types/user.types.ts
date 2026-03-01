// ============================================
// User Types
// ============================================

import type { AuditableEntity, SoftDeleteEntity, UUID, Metadata } from './common.types.js';
import type { Role } from '../constants/permissions.constants.js';

export interface User extends AuditableEntity, SoftDeleteEntity {
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  phoneNumber?: string;
  department?: string;
  title?: string;
  managerId?: UUID;
  organizationId: UUID;
  roles: Role[];
  status: UserStatus;
  preferences: UserPreferences;
  metadata: Metadata;
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'locked' | 'suspended';

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  taskAssigned: boolean;
  taskCompleted: boolean;
  approvalRequired: boolean;
  workflowCompleted: boolean;
  systemUpdates: boolean;
}

export interface UserProfile extends Pick<
  User,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'displayName'
  | 'avatar'
  | 'phoneNumber'
  | 'department'
  | 'title'
  | 'roles'
  | 'status'
> {}

export interface UserSummary {
  id: UUID;
  email: string;
  displayName: string;
  avatar?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: Role[];
  department?: string;
  title?: string;
  managerId?: UUID;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  title?: string;
  managerId?: UUID;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserFilter {
  status?: UserStatus[];
  roles?: Role[];
  department?: string;
  organizationId?: UUID;
  managerId?: UUID;
  search?: string;
}
