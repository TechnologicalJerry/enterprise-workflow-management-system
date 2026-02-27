// ============================================
// Validation Error
// ============================================

import { BaseError } from './base.error.js';
import { HTTP_STATUS } from '../constants/http-status.constants.js';
import { ERROR_CODES } from '../constants/error-codes.constants.js';
import type { ValidationError as ValidationErrorType } from '../types/api-response.types.js';

export class ValidationError extends BaseError {
  public readonly errors: ValidationErrorType[];

  constructor(errors: ValidationErrorType[], message: string = 'Validation failed') {
    super(message, ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, true, {
      validationErrors: errors,
    });
    this.errors = errors;
  }

  public static fromZodError(zodError: {
    errors: Array<{
      path: (string | number)[];
      message: string;
    }>;
  }): ValidationError {
    const errors: ValidationErrorType[] = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return new ValidationError(errors);
  }

  public static single(field: string, message: string, value?: unknown): ValidationError {
    return new ValidationError([{ field, message, value }]);
  }

  public static fromObject(errors: Record<string, string>): ValidationError {
    const validationErrors: ValidationErrorType[] = Object.entries(errors).map(
      ([field, message]) => ({
        field,
        message,
      })
    );
    return new ValidationError(validationErrors);
  }

  public getFieldError(field: string): ValidationErrorType | undefined {
    return this.errors.find((e) => e.field === field);
  }

  public hasFieldError(field: string): boolean {
    return this.errors.some((e) => e.field === field);
  }
}
