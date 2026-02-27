// ============================================
// Database Errors
// ============================================

import { BaseError, type ErrorDetails } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';

export class DatabaseError extends BaseError {
  public readonly operation: string;
  public readonly originalError?: Error;

  constructor(message: string, operation: string, originalError?: Error) {
    super(message, ERROR_CODES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, false, {
      operation,
      originalMessage: originalError?.message,
    });
    this.operation = operation;
    this.originalError = originalError;
  }
}

export class DatabaseQueryError extends DatabaseError {
  public readonly query?: string;

  constructor(message: string, query?: string, originalError?: Error) {
    super(message, 'query', originalError);
    this.query = process.env.NODE_ENV === 'development' ? query : undefined;
  }
}

export class DatabaseTransactionError extends DatabaseError {
  constructor(message: string = 'Transaction failed', originalError?: Error) {
    super(message, 'transaction', originalError);
  }
}

export class DatabaseConnectionPoolError extends DatabaseError {
  constructor(message: string = 'Connection pool exhausted', originalError?: Error) {
    super(message, 'connection_pool', originalError);
  }
}

export class UniqueConstraintViolationError extends BaseError {
  public readonly field: string;
  public readonly value: unknown;

  constructor(field: string, value: unknown) {
    super(
      `Unique constraint violation: ${field} already exists`,
      ERROR_CODES.CONFLICT,
      HTTP_STATUS.CONFLICT,
      true,
      { field, value }
    );
    this.field = field;
    this.value = value;
  }
}

export class ForeignKeyConstraintError extends BaseError {
  public readonly constraintName: string;

  constructor(constraintName: string, message?: string) {
    super(
      message ?? `Foreign key constraint violation: ${constraintName}`,
      ERROR_CODES.BAD_REQUEST,
      HTTP_STATUS.BAD_REQUEST,
      true,
      { constraintName }
    );
    this.constraintName = constraintName;
  }
}
