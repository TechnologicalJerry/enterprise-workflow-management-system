// ============================================
// Timeout Middleware
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { GatewayTimeoutError } from '../errors/http.error.js';

export interface TimeoutOptions {
  timeout: number;
  message?: string;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Middleware to add request timeout
 */
export function timeoutMiddleware(options: Partial<TimeoutOptions> = {}) {
  const { timeout = DEFAULT_TIMEOUT, message = 'Request timeout' } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        next(new GatewayTimeoutError(message));
      }
    }, timeout);

    // Clear timeout when response is finished
    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    res.on('close', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
}

/**
 * Creates a timeout middleware with custom duration for specific routes
 */
export function routeTimeout(timeout: number) {
  return timeoutMiddleware({ timeout });
}
