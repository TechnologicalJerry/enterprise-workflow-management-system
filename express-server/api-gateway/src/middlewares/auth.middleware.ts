// ============================================
// Authentication Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../config/app.config.js';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import { logger } from '../utils/logger.js';
import { redisClient } from '../services/redis.service.js';
import { redisKeyPrefixes } from '../config/redis.config.js';

// JWT Payload interface
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Extract token from Authorization header
const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
};

// Check if token is blacklisted
const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const blacklistKey = `${redisKeyPrefixes.tokenBlacklist}${token}`;
    const result = await redisClient.get(blacklistKey);
    return result !== null;
  } catch (error) {
    logger.warn('Failed to check token blacklist', { error });
    return false; // Fail open for availability
  }
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
    if (await isTokenBlacklisted(token)) {
      throw new HttpError(
        HTTP_STATUS.UNAUTHORIZED,
        'Token has been revoked',
        ERROR_CODES.AUTH.TOKEN_REVOKED
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, appConfig.jwt.accessSecret, {
      issuer: appConfig.jwt.issuer,
      audience: appConfig.jwt.audience,
    }) as JwtPayload;

    // Attach user to request
    req.user = decoded;

    logger.debug('User authenticated', {
      correlationId: req.correlationId,
      userId: decoded.sub,
      sessionId: decoded.sessionId,
    });

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      next(
        new HttpError(
          HTTP_STATUS.UNAUTHORIZED,
          'Token has expired',
          ERROR_CODES.AUTH.TOKEN_EXPIRED
        )
      );
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
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

// Optional authentication (doesn't fail if no token)
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractToken(req.headers.authorization);
  
  if (!token) {
    next();
    return;
  }

  // If token exists, validate it
  await authMiddleware(req, res, next);
};
