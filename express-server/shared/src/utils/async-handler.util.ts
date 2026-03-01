// ============================================
// Async Handler Utility
// ============================================

import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, unknown>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void> | Promise<Response<ResBody>>;

/**
 * Wraps async route handlers to catch errors and pass them to Express error middleware
 */
export function asyncHandler<
  P = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, unknown>
>(fn: AsyncRequestHandler<P, ResBody, ReqBody, ReqQuery>): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Wraps multiple async middleware functions
 */
export function asyncMiddleware(
  ...handlers: AsyncRequestHandler[]
): RequestHandler[] {
  return handlers.map((handler) => asyncHandler(handler));
}

/**
 * Combines multiple middleware into one
 */
export function combineMiddleware(...handlers: RequestHandler[]): RequestHandler {
  return (req, res, next) => {
    const executeHandler = (index: number): void => {
      if (index >= handlers.length) {
        return next();
      }

      const handler = handlers[index];
      if (handler) {
        handler(req, res, (err?: unknown) => {
          if (err) {
            return next(err);
          }
          executeHandler(index + 1);
        });
      }
    };

    executeHandler(0);
  };
}

/**
 * Creates a conditional middleware that only executes if condition is met
 */
export function conditionalMiddleware(
  condition: (req: Request) => boolean,
  middleware: RequestHandler
): RequestHandler {
  return (req, res, next) => {
    if (condition(req)) {
      return middleware(req, res, next);
    }
    next();
  };
}
