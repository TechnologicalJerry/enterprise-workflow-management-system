import { z } from 'zod';
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3004'),
  HOST: z.string().default('0.0.0.0'),
  SERVICE_NAME: z.string().default('workflow-definition-service'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.string().url(),
});
const env = envSchema.parse(process.env);
export const appConfig = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  service: { name: env.SERVICE_NAME, port: env.PORT, host: env.HOST },
  logging: { level: env.LOG_LEVEL },
} as const;
