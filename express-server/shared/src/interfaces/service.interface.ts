// ============================================
// Service Interface
// ============================================

import type { UUID } from '../types/common.types.js';
import type { PaginationParams, PaginatedResult } from '../types/pagination.types.js';

export interface IService<T, CreateDTO, UpdateDTO, Filter = Record<string, unknown>> {
  getById(id: UUID): Promise<T>;
  getAll(params?: PaginationParams): Promise<PaginatedResult<T>>;
  search(filter: Filter, params?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: CreateDTO): Promise<T>;
  update(id: UUID, data: UpdateDTO): Promise<T>;
  delete(id: UUID): Promise<void>;
}

export interface IAuthenticatedService<T, CreateDTO, UpdateDTO, Filter = Record<string, unknown>>
  extends IService<T, CreateDTO, UpdateDTO, Filter> {
  getById(id: UUID, userId: UUID): Promise<T>;
  create(data: CreateDTO, userId: UUID): Promise<T>;
  update(id: UUID, data: UpdateDTO, userId: UUID): Promise<T>;
  delete(id: UUID, userId: UUID): Promise<void>;
}

export interface IHealthCheckService {
  check(): Promise<HealthCheckResult>;
  checkDependency(name: string): Promise<DependencyHealth>;
  getAllDependenciesHealth(): Promise<DependencyHealth[]>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: Date;
  dependencies: DependencyHealth[];
}

export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  message?: string;
  lastChecked: Date;
}

export interface IStartupService {
  onStartup(): Promise<void>;
  onShutdown(): Promise<void>;
}

export interface IGracefulShutdownService {
  registerShutdownHandler(handler: () => Promise<void>): void;
  shutdown(): Promise<void>;
}
