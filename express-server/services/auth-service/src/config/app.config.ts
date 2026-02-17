// ============================================
// Application Configuration
// ============================================

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('0.0.0.0'),
  SERVICE_NAME: z.string().default('auth-service'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  USER_SERVICE_URL: z.string().url().default('http://localhost:3002'),
  PERMISSION_SERVICE_URL: z.string().url().default('http://localhost:3003'),
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
  }
  
  return parsed.data;
};

const env = parseEnv();

export const appConfig = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  service: {
    name: env.SERVICE_NAME,
    port: env.PORT,
    host: env.HOST,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
  userServiceUrl: env.USER_SERVICE_URL,
  permissionServiceUrl: env.PERMISSION_SERVICE_URL,
} as const;

export type AppConfig = typeof appConfig;
