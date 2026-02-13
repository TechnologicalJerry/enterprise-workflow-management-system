// ============================================
// Rate Limiting Configuration
// ============================================

import { z } from 'zod';

const envSchema = z.object({
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: z.string().transform((v) => v === 'true').default('false'),
  RATE_LIMIT_SKIP_FAILED_REQUESTS: z.string().transform((v) => v === 'true').default('false'),
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    return envSchema.parse({});
  }
  return parsed.data;
};

const env = parseEnv();

export const rateLimitConfig = {
  // Global rate limit
  global: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      success: false,
      error: {
        code: 'ERR_9000',
        message: 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS,
    skipFailedRequests: env.RATE_LIMIT_SKIP_FAILED_REQUESTS,
  },
  
  // Auth endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
      success: false,
      error: {
        code: 'ERR_9000',
        message: 'Too many authentication attempts, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Password reset - very strict
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
      success: false,
      error: {
        code: 'ERR_9000',
        message: 'Too many password reset attempts, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // API endpoints - moderate limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: {
      success: false,
      error: {
        code: 'ERR_9000',
        message: 'Rate limit exceeded',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
} as const;

export type RateLimitConfig = typeof rateLimitConfig;
