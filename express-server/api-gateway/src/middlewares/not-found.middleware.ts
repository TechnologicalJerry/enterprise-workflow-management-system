// ============================================
// Not Found (404) Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';

export const notFoundMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(
    new HttpError(
      HTTP_STATUS.NOT_FOUND,
      `Route ${req.method} ${req.path} not found`,
      ERROR_CODES.GENERAL.NOT_FOUND
    )
  );
};
