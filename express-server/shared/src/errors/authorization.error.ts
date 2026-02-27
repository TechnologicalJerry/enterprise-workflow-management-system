// ============================================
// Authorization Errors
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';
import type { Permission, Role } from '../constants/permissions.constants.js';

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Access denied', details?: ErrorDetails) {
    super(message, ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN, true, details);
  }
}

export class InsufficientPermissionsError extends BaseError {
  public readonly requiredPermissions: Permission[];
  public readonly userPermissions: Permission[];

  constructor(
    requiredPermissions: Permission[],
    userPermissions: Permission[] = [],
    message?: string
  ) {
    const defaultMessage = `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`;
    super(
      message ?? defaultMessage,
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      HTTP_STATUS.FORBIDDEN,
      true,
      {
        requiredPermissions,
        userPermissions,
      }
    );
    this.requiredPermissions = requiredPermissions;
    this.userPermissions = userPermissions;
  }
}

export class RoleNotFoundError extends BaseError {
  public readonly role: Role | string;

  constructor(role: Role | string) {
    super(`Role '${role}' not found`, ERROR_CODES.ROLE_NOT_FOUND, HTTP_STATUS.NOT_FOUND, true, {
      role,
    });
    this.role = role;
  }
}

export class PermissionDeniedError extends BaseError {
  public readonly resource: string;
  public readonly action: string;

  constructor(resource: string, action: string, message?: string) {
    const defaultMessage = `Permission denied: cannot ${action} ${resource}`;
    super(
      message ?? defaultMessage,
      ERROR_CODES.PERMISSION_DENIED,
      HTTP_STATUS.FORBIDDEN,
      true,
      {
        resource,
        action,
      }
    );
    this.resource = resource;
    this.action = action;
  }
}
