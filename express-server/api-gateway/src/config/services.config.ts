// ============================================
// Service Registry Configuration
// ============================================

import { z } from 'zod';

const serviceUrlSchema = z.string().url();

const envSchema = z.object({
  AUTH_SERVICE_URL: serviceUrlSchema.default('http://localhost:3001'),
  USER_SERVICE_URL: serviceUrlSchema.default('http://localhost:3002'),
  PERMISSION_SERVICE_URL: serviceUrlSchema.default('http://localhost:3003'),
  WORKFLOW_DEFINITION_SERVICE_URL: serviceUrlSchema.default('http://localhost:3004'),
  WORKFLOW_INSTANCE_SERVICE_URL: serviceUrlSchema.default('http://localhost:3005'),
  TASK_SERVICE_URL: serviceUrlSchema.default('http://localhost:3006'),
  APPROVAL_SERVICE_URL: serviceUrlSchema.default('http://localhost:3007'),
  DOCUMENT_SERVICE_URL: serviceUrlSchema.default('http://localhost:3008'),
  AUDIT_SERVICE_URL: serviceUrlSchema.default('http://localhost:3009'),
  NOTIFICATION_SERVICE_URL: serviceUrlSchema.default('http://localhost:3010'),
  REPORTING_SERVICE_URL: serviceUrlSchema.default('http://localhost:3011'),
});

const parseEnv = (): z.infer<typeof envSchema> => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid service URLs:');
    console.error(parsed.error.format());
    process.exit(1);
  }
  
  return parsed.data;
};

const env = parseEnv();

export interface ServiceEndpoint {
  name: string;
  url: string;
  timeout: number;
  retries: number;
  healthPath: string;
}

export const servicesConfig: Record<string, ServiceEndpoint> = {
  auth: {
    name: 'auth-service',
    url: env.AUTH_SERVICE_URL,
    timeout: 5000,
    retries: 3,
    healthPath: '/health',
  },
  user: {
    name: 'user-service',
    url: env.USER_SERVICE_URL,
    timeout: 5000,
    retries: 3,
    healthPath: '/health',
  },
  permission: {
    name: 'permission-service',
    url: env.PERMISSION_SERVICE_URL,
    timeout: 5000,
    retries: 3,
    healthPath: '/health',
  },
  workflowDefinition: {
    name: 'workflow-definition-service',
    url: env.WORKFLOW_DEFINITION_SERVICE_URL,
    timeout: 10000,
    retries: 3,
    healthPath: '/health',
  },
  workflowInstance: {
    name: 'workflow-instance-service',
    url: env.WORKFLOW_INSTANCE_SERVICE_URL,
    timeout: 10000,
    retries: 3,
    healthPath: '/health',
  },
  task: {
    name: 'task-service',
    url: env.TASK_SERVICE_URL,
    timeout: 5000,
    retries: 3,
    healthPath: '/health',
  },
  approval: {
    name: 'approval-service',
    url: env.APPROVAL_SERVICE_URL,
    timeout: 5000,
    retries: 3,
    healthPath: '/health',
  },
  document: {
    name: 'document-service',
    url: env.DOCUMENT_SERVICE_URL,
    timeout: 30000, // Longer for file uploads
    retries: 2,
    healthPath: '/health',
  },
  audit: {
    name: 'audit-service',
    url: env.AUDIT_SERVICE_URL,
    timeout: 5000,
    retries: 3,
    healthPath: '/health',
  },
  notification: {
    name: 'notification-service',
    url: env.NOTIFICATION_SERVICE_URL,
    timeout: 5000,
    retries: 3,
    healthPath: '/health',
  },
  reporting: {
    name: 'reporting-service',
    url: env.REPORTING_SERVICE_URL,
    timeout: 30000, // Longer for reports
    retries: 2,
    healthPath: '/health',
  },
};

export const getServiceUrl = (serviceName: keyof typeof servicesConfig): string => {
  const service = servicesConfig[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return service.url;
};
