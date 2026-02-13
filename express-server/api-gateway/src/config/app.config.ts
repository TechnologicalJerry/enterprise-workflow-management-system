// ============================================
// Application Configuration
// ============================================

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default('workflow-system'),
  JWT_AUDIENCE: z.string().default('workflow-api'),
  
  // Request
  REQUEST_TIMEOUT_MS: z.string().transform(Number).default('30000'),
  BODY_LIMIT: z.string().default('10mb'),
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
  
  server: {
    port: env.PORT,
    host: env.HOST,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
  
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  },
  
  request: {
    timeout: env.REQUEST_TIMEOUT_MS,
    bodyLimit: env.BODY_LIMIT,
  },
} as const;

export type AppConfig = typeof appConfig;
