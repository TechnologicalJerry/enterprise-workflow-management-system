// ============================================
// Redis Configuration
// ============================================

import { z } from 'zod';
import type { RedisOptions } from 'ioredis';

const envSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),
  REDIS_KEY_PREFIX: z.string().default('auth:'),
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    return envSchema.parse({});
  }
  return parsed.data;
};

const env = parseEnv();

export const redisConfig: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  db: env.REDIS_DB,
  keyPrefix: env.REDIS_KEY_PREFIX,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
};

export const redisKeyPrefixes = {
  session: 'session:',
  tokenBlacklist: 'blacklist:',
  refreshToken: 'refresh:',
  rateLimitLogin: 'rate_limit:login:',
} as const;
