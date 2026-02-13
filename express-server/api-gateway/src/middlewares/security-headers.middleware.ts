// ============================================
// Security Headers Middleware
// ============================================

import { Request, Response, NextFunction } from 'express';

export const securityHeadersMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filter in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove X-Powered-By header (Express default)
  res.removeHeader('X-Powered-By');
  
  // Permissions Policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Content Security Policy for API
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'"
  );

  next();
};
