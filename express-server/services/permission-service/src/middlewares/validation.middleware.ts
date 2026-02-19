import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

const formatZodErrors = (error: ZodError): { field: string; message: string }[] =>
  error.errors.map((err) => ({ field: err.path.join('.'), message: err.message }));

export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          throw new HttpError(
            HTTP_STATUS.BAD_REQUEST,
            'Request body validation failed',
            ERROR_CODES.GENERAL.VALIDATION_ERROR,
            formatZodErrors(result.error)
          );
        }
        req.body = result.data;
      }
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          throw new HttpError(
            HTTP_STATUS.BAD_REQUEST,
            'Query validation failed',
            ERROR_CODES.GENERAL.VALIDATION_ERROR,
            formatZodErrors(result.error)
          );
        }
        req.query = result.data;
      }
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          throw new HttpError(
            HTTP_STATUS.BAD_REQUEST,
            'Params validation failed',
            ERROR_CODES.GENERAL.VALIDATION_ERROR,
            formatZodErrors(result.error)
          );
        }
        req.params = result.data;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
