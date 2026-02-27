// ============================================
// Error Handler Middleware
// ============================================

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { BaseError } from '../errors/base.error.js';
import { ValidationError } from '../errors/validation.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';
import type { ILogger } from '../interfaces/logger.interface.js';
import type { ApiResponse, ApiError } from '../types/api-response.types.js';

export interface ErrorHandlerOptions {
  logger: ILogger;
  includeStack?: boolean;
  onError?: (error: Error, req: Request) => void;
}

/**
 * Creates the global error handler middleware
 */
export function errorHandlerMiddleware(options: ErrorHandlerOptions): ErrorRequestHandler {
  const { logger, includeStack = false, onError } = options;

  return (
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
  ): void => {
    // Call custom error handler if provided
    if (onError) {
      onError(error, req);
    }

    // Determine if this is an operational error
    const isOperational = BaseError.isOperationalError(error);

    // Log the error
    if (isOperational) {
      logger.warn('Operational error', {
        correlationId: req.correlationId,
        error: error.message,
        code: BaseError.isBaseError(error) ? error.code : undefined,
        path: req.path,
        method: req.method,
      });
    } else {
      logger.error('Unexpected error', error, {
        correlationId: req.correlationId,
        path: req.path,
        method: req.method,
      });
    }

    // Build error response
    const response = buildErrorResponse(error, req.correlationId, includeStack);

    // Set response status and send
    const statusCode = BaseError.isBaseError(error)
      ? error.statusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json(response);
  };
}

/**
 * Builds a standardized error response
 */
function buildErrorResponse(
  error: Error,
  correlationId: string,
  includeStack: boolean
): ApiResponse<never> {
  let apiError: ApiError;

  if (error instanceof ValidationError) {
    apiError = {
      code: error.code,
      message: error.message,
      details: error.errors,
    };
  } else if (BaseError.isBaseError(error)) {
    apiError = {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  } else {
    // Unknown error - don't expose internal details in production
    const isProduction = process.env.NODE_ENV === 'production';
    apiError = {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: isProduction ? 'An unexpected error occurred' : error.message,
    };
  }

  // Include stack trace only in development
  if (includeStack && process.env.NODE_ENV !== 'production') {
    apiError.stack = error.stack;
  }

  return {
    success: false,
    error: apiError,
    timestamp: new Date().toISOString(),
    correlationId,
  };
}

/**
 * Async error wrapper for route handlers
 */
export function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
