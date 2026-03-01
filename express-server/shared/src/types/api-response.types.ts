// ============================================
// API Response Types
// ============================================

import type { PaginationMeta } from './pagination.types.js';
import type { ErrorCode } from '../constants/error-codes.constants.js';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
  timestamp: string;
  correlationId: string;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: ValidationError[] | Record<string, unknown>;
  stack?: string; // Only in development
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

export interface ResponseMeta {
  pagination?: PaginationMeta;
  requestId?: string;
  processingTime?: number;
  version?: string;
  deprecationWarning?: string;
}

export interface SuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse extends ApiResponse<never> {
  success: false;
  error: ApiError;
}

export interface ListResponse<T> extends ApiResponse<T[]> {
  success: true;
  data: T[];
  meta: ResponseMeta & {
    pagination: PaginationMeta;
  };
}

export interface CreatedResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface NoContentResponse extends ApiResponse<never> {
  success: true;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface MetricsResponse {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  connections: {
    database: number;
    redis: number;
    kafka: number;
  };
}
