import { z } from 'zod';
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3011'),
  HOST: z.string().default('0.0.0.0'),
  SERVICE_NAME: z.string().default('reporting-service'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.string().url(),
  WORKFLOW_INSTANCE_SERVICE_URL: z.string().url().default('http://localhost:3005'),
  TASK_SERVICE_URL: z.string().url().default('http://localhost:3006'),
  APPROVAL_SERVICE_URL: z.string().url().default('http://localhost:3007'),
});
const env = envSchema.parse(process.env);
export const appConfig = {
  env: env.NODE_ENV,
  service: { name: env.SERVICE_NAME, port: env.PORT, host: env.HOST },
  logging: { level: env.LOG_LEVEL },
  workflowInstanceServiceUrl: env.WORKFLOW_INSTANCE_SERVICE_URL,
  taskServiceUrl: env.TASK_SERVICE_URL,
  approvalServiceUrl: env.APPROVAL_SERVICE_URL,
} as const;
