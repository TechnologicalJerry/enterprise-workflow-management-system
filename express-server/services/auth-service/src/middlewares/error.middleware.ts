// ============================================
// Error Handler Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http.error.js';
import { logger } from '../utils/logger.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
import { appConfig } from '../config/app.config.js';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
    stack?: string;
  };
  timestamp: string;
  correlationId: string;
  path: string;
}

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = ERROR_CODES.GENERAL.INTERNAL_ERROR;
  let message = 'An unexpected error occurred';
  let details: unknown[] | undefined;

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    errorCode = error.errorCode;
    message = error.message;
    details = error.details;
  } else if (error.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.GENERAL.VALIDATION_ERROR;
    message = error.message;
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.GENERAL.INVALID_JSON;
    message = 'Invalid JSON in request body';
  }

  const logData = {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    statusCode,
    errorCode,
    message: error.message,
    stack: error.stack,
    userId: req.user?.sub,
  };

  if (statusCode >= 500) {
    logger.error('Server error', logData);
  } else {
    logger.warn('Client error', logData);
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
      stack: appConfig.isDevelopment ? error.stack : undefined,
    },
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
    path: req.path,
  };

  if (!errorResponse.error.details) {
    delete errorResponse.error.details;
  }
  if (!errorResponse.error.stack) {
    delete errorResponse.error.stack;
  }

  res.status(statusCode).json(errorResponse);
};
