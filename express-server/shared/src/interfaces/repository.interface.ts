// ============================================
// Repository Interface
// ============================================

import type { UUID } from '../types/common.types.js';
import type { PaginationParams, PaginatedResult } from '../types/pagination.types.js';

export interface IRepository<T, CreateDTO, UpdateDTO> {
  findById(id: UUID): Promise<T | null>;
  findAll(params?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: CreateDTO): Promise<T>;
  update(id: UUID, data: UpdateDTO): Promise<T>;
  delete(id: UUID): Promise<void>;
  exists(id: UUID): Promise<boolean>;
}

export interface ISoftDeleteRepository<T, CreateDTO, UpdateDTO>
  extends IRepository<T, CreateDTO, UpdateDTO> {
  softDelete(id: UUID): Promise<void>;
  restore(id: UUID): Promise<T>;
  findDeleted(params?: PaginationParams): Promise<PaginatedResult<T>>;
  hardDelete(id: UUID): Promise<void>;
}

export interface ISearchableRepository<T, Filter> {
  search(filter: Filter, params?: PaginationParams): Promise<PaginatedResult<T>>;
  count(filter?: Filter): Promise<number>;
}

export interface IBulkRepository<T, CreateDTO> {
  createMany(data: CreateDTO[]): Promise<T[]>;
  updateMany(ids: UUID[], data: Partial<T>): Promise<number>;
  deleteMany(ids: UUID[]): Promise<number>;
}

export interface ITransactionalRepository {
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
  executeInTransaction<R>(operation: () => Promise<R>): Promise<R>;
}

export interface IQueryBuilder<T> {
  where(field: keyof T, operator: QueryOperator, value: unknown): this;
  whereIn(field: keyof T, values: unknown[]): this;
  whereNull(field: keyof T): this;
  whereNotNull(field: keyof T): this;
  orderBy(field: keyof T, direction: 'asc' | 'desc'): this;
  limit(count: number): this;
  offset(count: number): this;
  include(relation: string): this;
  select(fields: (keyof T)[]): this;
  execute(): Promise<T[]>;
  first(): Promise<T | null>;
  count(): Promise<number>;
}

export type QueryOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike';
