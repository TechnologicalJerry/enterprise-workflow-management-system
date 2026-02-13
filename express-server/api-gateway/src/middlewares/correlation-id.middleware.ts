// ============================================
// Correlation ID Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get correlation ID from header or generate new one
  const correlationId = 
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    uuidv4();

  // Attach to request object
  req.correlationId = correlationId;

  // Set response headers
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Request-ID', correlationId);

  next();
};
