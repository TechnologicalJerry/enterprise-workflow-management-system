// ============================================
// Service Registry Types
// ============================================

import type { UUID } from './common.types.js';

export interface ServiceInstance {
  id: UUID;
  name: ServiceName;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc';
  healthCheckUrl: string;
  status: ServiceStatus;
  metadata: ServiceMetadata;
  registeredAt: Date;
  lastHeartbeat: Date;
  weight: number;
}

export type ServiceName =
  | 'api-gateway'
  | 'auth-service'
  | 'user-service'
  | 'permission-service'
  | 'workflow-definition-service'
  | 'workflow-instance-service'
  | 'task-service'
  | 'approval-service'
  | 'document-service'
  | 'audit-service'
  | 'notification-service'
  | 'reporting-service';

export type ServiceStatus = 'healthy' | 'unhealthy' | 'starting' | 'stopping' | 'unknown';

export interface ServiceMetadata {
  environment: string;
  region?: string;
  zone?: string;
  tags?: string[];
  capabilities?: string[];
}

export interface ServiceEndpoint {
  service: ServiceName;
  baseUrl: string;
  timeout: number;
  retries: number;
  circuitBreaker: CircuitBreakerConfig;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  threshold: number;
  timeout: number;
  resetTimeout: number;
}

export interface ServiceDiscoveryConfig {
  enabled: boolean;
  provider: 'consul' | 'etcd' | 'kubernetes' | 'static';
  refreshInterval: number;
  healthCheckInterval: number;
  deregisterAfter: number;
}

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'random' | 'least-connections' | 'weighted';
  healthCheckEnabled: boolean;
  stickySession?: {
    enabled: boolean;
    cookieName: string;
    ttl: number;
  };
}

export interface ServiceCallOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  circuitBreakerOverride?: Partial<CircuitBreakerConfig>;
}

export interface ServiceCallResult<T> {
  data: T;
  statusCode: number;
  headers: Record<string, string>;
  responseTime: number;
  instanceId: UUID;
}

export const SERVICE_PORTS: Record<ServiceName, number> = {
  'api-gateway': 3000,
  'auth-service': 3001,
  'user-service': 3002,
  'permission-service': 3003,
  'workflow-definition-service': 3004,
  'workflow-instance-service': 3005,
  'task-service': 3006,
  'approval-service': 3007,
  'document-service': 3008,
  'audit-service': 3009,
  'notification-service': 3010,
  'reporting-service': 3011,
};
