// ============================================
// Request Logger Middleware
// ============================================

import type { Request, Response, NextFunction } from 'express';
import type { ILogger } from '../interfaces/logger.interface.js';

export interface RequestLoggerOptions {
  logger: ILogger;
  skipPaths?: string[];
  sensitiveHeaders?: string[];
  logBody?: boolean;
  maxBodyLength?: number;
}

const DEFAULT_SKIP_PATHS = ['/health', '/ready', '/live', '/metrics'];
const DEFAULT_SENSITIVE_HEADERS = ['authorization', 'cookie', 'x-api-key'];
const DEFAULT_MAX_BODY_LENGTH = 1000;

/**
 * Middleware to log HTTP requests and responses
 */
export function requestLoggerMiddleware(options: RequestLoggerOptions) {
  const {
    logger,
    skipPaths = DEFAULT_SKIP_PATHS,
    sensitiveHeaders = DEFAULT_SENSITIVE_HEADERS,
    logBody = false,
    maxBodyLength = DEFAULT_MAX_BODY_LENGTH,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip logging for certain paths
    if (skipPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();

    // Log request
    const requestLog: Record<string, unknown> = {
      method: req.method,
      path: req.path,
      query: req.query,
      correlationId: req.correlationId,
      requestId: req.requestId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      headers: sanitizeHeaders(req.headers as Record<string, string>, sensitiveHeaders),
    };

    if (logBody && req.body && Object.keys(req.body as object).length > 0) {
      requestLog.body = truncateBody(req.body, maxBodyLength);
    }

    logger.info('Incoming request', requestLog);

    // Capture original end function
    const originalEnd = res.end.bind(res);

    // Override end to log response
    res.end = function (chunk?: unknown, ...args: unknown[]): Response {
      const duration = Date.now() - startTime;

      const responseLog: Record<string, unknown> = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        correlationId: req.correlationId,
        requestId: req.requestId,
      };

      if (res.statusCode >= 400) {
        logger.warn('Request completed with error', responseLog);
      } else {
        logger.info('Request completed', responseLog);
      }

      return originalEnd(chunk, ...args);
    } as typeof res.end;

    next();
  };
}

/**
 * Removes sensitive headers from log output
 */
function sanitizeHeaders(
  headers: Record<string, string>,
  sensitiveHeaders: string[]
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Truncates request body for logging
 */
function truncateBody(body: unknown, maxLength: number): unknown {
  const stringified = JSON.stringify(body);
  if (stringified.length <= maxLength) {
    return body;
  }
  return `${stringified.slice(0, maxLength)}... [truncated]`;
}
