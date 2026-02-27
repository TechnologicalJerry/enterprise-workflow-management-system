// ============================================
// Correlation ID Middleware
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { generateUUID } from '../utils/crypto.util.js';

export const CORRELATION_ID_HEADER = 'X-Correlation-ID';
export const REQUEST_ID_HEADER = 'X-Request-ID';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      requestId: string;
    }
  }
}

/**
 * Middleware to extract or generate correlation ID
 */
export function correlationIdMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Extract or generate correlation ID (for distributed tracing)
    const correlationId =
      (req.headers[CORRELATION_ID_HEADER.toLowerCase()] as string) ?? generateUUID();

    // Always generate new request ID (unique per request)
    const requestId = generateUUID();

    // Attach to request object
    req.correlationId = correlationId;
    req.requestId = requestId;

    // Set response headers
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  };
}

/**
 * Get correlation ID from request
 */
export function getCorrelationId(req: Request): string {
  return req.correlationId;
}

/**
 * Get request ID from request
 */
export function getRequestId(req: Request): string {
  return req.requestId;
}

/**
 * Creates headers object with correlation ID for inter-service calls
 */
export function createCorrelationHeaders(correlationId: string): Record<string, string> {
  return {
    [CORRELATION_ID_HEADER]: correlationId,
    [REQUEST_ID_HEADER]: generateUUID(),
  };
}
