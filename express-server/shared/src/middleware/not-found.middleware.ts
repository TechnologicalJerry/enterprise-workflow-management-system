// ============================================
// Not Found Middleware
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { RouteNotFoundError } from '../errors/not-found.error.js';

/**
 * Middleware to handle 404 - Route not found
 */
export function notFoundMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    next(new RouteNotFoundError(req.method, req.path));
  };
}
