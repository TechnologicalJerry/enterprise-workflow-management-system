// ============================================
// Authentication Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../security/jwt.js';
import { tokenBlacklist } from '../database/redis.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import { logger } from '../utils/logger.js';

// Extract token from Authorization header
const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
};

// Authentication middleware
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication required',
        ERROR_CODES.AUTH.MISSING_TOKEN
      );
    }

    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Token has been revoked',
        ERROR_CODES.AUTH.TOKEN_REVOKED
      );
    }

    // Verify JWT
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(
        new HttpError(
          HTTP_STATUS.UNAUTHORIZED,
          'Token has expired',
          ERROR_CODES.AUTH.TOKEN_EXPIRED
        )
      );
      return;
    }

    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(
        new HttpError(
          HTTP_STATUS.UNAUTHORIZED,
          'Invalid token',
          ERROR_CODES.AUTH.INVALID_TOKEN
        )
      );
      return;
    }

    logger.error('Authentication error', {
      correlationId: req.correlationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    next(
      new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Authentication failed',
        ERROR_CODES.AUTH.AUTHENTICATION_FAILED
      )
    );
  }
};
