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

const formatZodErrors = (error: ZodError): { field: string; message: string }[] => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
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
