// ============================================
// CORS Configuration
// ============================================

import { z } from 'zod';
import type { CorsOptions } from 'cors';

const envSchema = z.object({
  CORS_ORIGINS: z.string().default('http://localhost:4200,http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform((v) => v === 'true').default('true'),
  CORS_MAX_AGE: z.string().transform(Number).default('86400'), // 24 hours
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    return envSchema.parse({});
  }
  return parsed.data;
};

const env = parseEnv();

const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  
  credentials: env.CORS_CREDENTIALS,
  
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Correlation-ID',
    'X-Request-ID',
    'X-API-Key',
    'X-Idempotency-Key',
  ],
  
  exposedHeaders: [
    'X-Correlation-ID',
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  
  maxAge: env.CORS_MAX_AGE,
  
  preflightContinue: false,
  
  optionsSuccessStatus: 204,
};
