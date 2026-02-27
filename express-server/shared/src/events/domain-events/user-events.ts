// ============================================
// User Domain Events
// ============================================

import type { UUID } from '../../types/common.types.js';
import type { Role } from '../../constants/permissions.constants.js';
import type { UserStatus } from '../../types/user.types.js';

export interface UserCreatedPayload {
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  organizationId: UUID;
}

export interface UserUpdatedPayload {
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}

export interface UserDeletedPayload {
  email: string;
  reason?: string;
}

export interface UserStatusChangedPayload {
  previousStatus: UserStatus;
  newStatus: UserStatus;
  reason?: string;
}

export interface UserRolesChangedPayload {
  previousRoles: Role[];
  newRoles: Role[];
  changedBy: UUID;
}

export interface UserPasswordChangedPayload {
  changedBy: UUID;
  ipAddress?: string;
}

export const USER_EVENT_TYPES = {
  USER_CREATED: 'UserCreated',
  USER_UPDATED: 'UserUpdated',
  USER_DELETED: 'UserDeleted',
  USER_STATUS_CHANGED: 'UserStatusChanged',
  USER_ROLES_CHANGED: 'UserRolesChanged',
  USER_PASSWORD_CHANGED: 'UserPasswordChanged',
} as const;

export type UserEventType = (typeof USER_EVENT_TYPES)[keyof typeof USER_EVENT_TYPES];
