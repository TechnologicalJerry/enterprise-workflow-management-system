// ============================================
// Base Error Class
// ============================================

import type { ErrorCode } from '../constants/error-codes.constants.js';
import type { HttpStatusCode } from '../constants/http-status.constants.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';

export interface ErrorDetails {
  [key: string]: unknown;
}

export abstract class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: HttpStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: ErrorDetails;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: ErrorDetails
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Ensure the prototype chain is correctly set
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }

  public static isBaseError(error: unknown): error is BaseError {
    return error instanceof BaseError;
  }

  public static isOperationalError(error: unknown): boolean {
    if (BaseError.isBaseError(error)) {
      return error.isOperational;
    }
    return false;
  }
}
