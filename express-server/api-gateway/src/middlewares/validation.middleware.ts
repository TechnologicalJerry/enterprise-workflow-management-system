// ============================================
// Request Validation Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

// Format Zod errors into a user-friendly structure
const formatZodErrors = (error: ZodError): { field: string; message: string }[] => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

// Validation middleware factory
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate body
      if (schemas.body) {
        const bodyResult = schemas.body.safeParse(req.body);
        if (!bodyResult.success) {
          throw new HttpError(
            HTTP_STATUS.BAD_REQUEST,
            'Request body validation failed',
            ERROR_CODES.GENERAL.VALIDATION_ERROR,
            formatZodErrors(bodyResult.error)
          );
        }
        req.body = bodyResult.data;
      }

      // Validate query parameters
      if (schemas.query) {
        const queryResult = schemas.query.safeParse(req.query);
        if (!queryResult.success) {
          throw new HttpError(
            HTTP_STATUS.BAD_REQUEST,
            'Query parameters validation failed',
            ERROR_CODES.GENERAL.VALIDATION_ERROR,
            formatZodErrors(queryResult.error)
          );
        }
        req.query = queryResult.data;
      }

      // Validate URL parameters
      if (schemas.params) {
        const paramsResult = schemas.params.safeParse(req.params);
        if (!paramsResult.success) {
          throw new HttpError(
            HTTP_STATUS.BAD_REQUEST,
            'URL parameters validation failed',
            ERROR_CODES.GENERAL.VALIDATION_ERROR,
            formatZodErrors(paramsResult.error)
          );
        }
        req.params = paramsResult.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const searchQuerySchema = z.object({
  search: z.string().optional(),
  ...paginationSchema.shape,
});
