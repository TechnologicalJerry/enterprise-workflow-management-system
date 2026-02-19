import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS, ERROR_CODES } from '@workflow/shared';
declare global { namespace Express { interface Request { correlationId: string; userId?: string } } }
export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.correlationId = (req.headers['x-correlation-id'] as string) || (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.userId = req.headers['x-user-id'] as string | undefined;
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};
export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof HttpError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const errorCode = err instanceof HttpError ? err.errorCode : ERROR_CODES.GENERAL.INTERNAL_ERROR;
  res.status(statusCode).json({ success: false, error: { code: errorCode, message: err.message }, correlationId: req.correlationId });
};
