// ============================================
// Error Response DTOs
// ============================================

import { z } from 'zod';
import type { ValidationError } from '../types/api-response.types.js';
import type { ErrorCode } from '../constants/error-codes.constants.js';

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.union([
      z.array(
        z.object({
          field: z.string(),
          message: z.string(),
          value: z.unknown().optional(),
          constraints: z.record(z.string()).optional(),
        })
      ),
      z.record(z.unknown()),
    ]).optional(),
    stack: z.string().optional(),
  }),
  timestamp: z.string(),
  correlationId: z.string(),
});

export type ErrorResponseDto = z.infer<typeof ErrorResponseSchema>;

export class ErrorBuilder {
  private code: ErrorCode;
  private message: string;
  private details?: ValidationError[] | Record<string, unknown>;
  private stack?: string;

  constructor(code: ErrorCode, message: string) {
    this.code = code;
    this.message = message;
  }

  withDetails(details: ValidationError[] | Record<string, unknown>): this {
    this.details = details;
    return this;
  }

  withStack(stack: string): this {
    this.stack = stack;
    return this;
  }

  withValidationErrors(errors: ValidationError[]): this {
    this.details = errors;
    return this;
  }

  build(): {
    code: ErrorCode;
    message: string;
    details?: ValidationError[] | Record<string, unknown>;
    stack?: string;
  } {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }
}
