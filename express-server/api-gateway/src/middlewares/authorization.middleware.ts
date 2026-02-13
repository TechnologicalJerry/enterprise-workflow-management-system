// ============================================
// Authorization Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import { logger } from '../utils/logger.js';

// Role-based access control
export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new HttpError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required',
          ERROR_CODES.AUTH.MISSING_TOKEN
        )
      );
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      logger.warn('Access denied - insufficient role', {
        correlationId: req.correlationId,
        userId: req.user.sub,
        requiredRoles: allowedRoles,
        userRoles,
        path: req.path,
      });

      next(
        new HttpError(
          HTTP_STATUS.FORBIDDEN,
          'Insufficient permissions',
          ERROR_CODES.AUTH.INSUFFICIENT_PERMISSIONS
        )
      );
      return;
    }

    next();
  };
};

// Permission-based access control
export const requirePermissions = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new HttpError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required',
          ERROR_CODES.AUTH.MISSING_TOKEN
        )
      );
      return;
    }

    const userPermissions = req.user.permissions || [];
    const hasPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermissions) {
      logger.warn('Access denied - missing permissions', {
        correlationId: req.correlationId,
        userId: req.user.sub,
        requiredPermissions,
        userPermissions,
        path: req.path,
      });

      next(
        new HttpError(
          HTTP_STATUS.FORBIDDEN,
          'Insufficient permissions',
          ERROR_CODES.AUTH.INSUFFICIENT_PERMISSIONS
        )
      );
      return;
    }

    next();
  };
};

// Combined role OR permission check
export const requireAny = (roles: string[], permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new HttpError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required',
          ERROR_CODES.AUTH.MISSING_TOKEN
        )
      );
      return;
    }

    const userRoles = req.user.roles || [];
    const userPermissions = req.user.permissions || [];

    const hasRole = roles.some((role) => userRoles.includes(role));
    const hasPermission = permissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasRole && !hasPermission) {
      logger.warn('Access denied - insufficient role or permission', {
        correlationId: req.correlationId,
        userId: req.user.sub,
        requiredRoles: roles,
        requiredPermissions: permissions,
        path: req.path,
      });

      next(
        new HttpError(
          HTTP_STATUS.FORBIDDEN,
          'Insufficient permissions',
          ERROR_CODES.AUTH.INSUFFICIENT_PERMISSIONS
        )
      );
      return;
    }

    next();
  };
};

// Admin-only access
export const requireAdmin = requireRoles('admin', 'super_admin');

// Resource owner check (for user-specific resources)
export const requireOwnerOrAdmin = (
  getResourceOwnerId: (req: Request) => string | null
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new HttpError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required',
          ERROR_CODES.AUTH.MISSING_TOKEN
        )
      );
      return;
    }

    const resourceOwnerId = getResourceOwnerId(req);
    const isOwner = resourceOwnerId === req.user.sub;
    const isAdmin = req.user.roles?.includes('admin') || 
                    req.user.roles?.includes('super_admin');

    if (!isOwner && !isAdmin) {
      logger.warn('Access denied - not owner or admin', {
        correlationId: req.correlationId,
        userId: req.user.sub,
        resourceOwnerId,
        path: req.path,
      });

      next(
        new HttpError(
          HTTP_STATUS.FORBIDDEN,
          'Access denied',
          ERROR_CODES.AUTH.ACCESS_DENIED
        )
      );
      return;
    }

    next();
  };
};
