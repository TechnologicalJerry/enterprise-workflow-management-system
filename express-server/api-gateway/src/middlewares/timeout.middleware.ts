// ============================================
// Request Timeout Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http.error.js';
import { HTTP_STATUS } from '@workflow/shared';

export const timeoutMiddleware = (timeoutMs: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set response timeout
    res.setTimeout(timeoutMs, () => {
      if (!res.headersSent) {
        const error = new HttpError(
          HTTP_STATUS.REQUEST_TIMEOUT,
          'Request timeout',
          'ERR_1005'
        );
        next(error);
      }
    });

    // Track if response was sent
    let responseSent = false;
    
    const originalSend = res.send;
    res.send = function (body): Response {
      responseSent = true;
      return originalSend.call(this, body);
    };

    const originalJson = res.json;
    res.json = function (body): Response {
      responseSent = true;
      return originalJson.call(this, body);
    };

    // Clear timeout when response is finished
    res.on('finish', () => {
      responseSent = true;
    });

    next();
  };
};
