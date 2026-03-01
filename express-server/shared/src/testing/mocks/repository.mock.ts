// ============================================
// Repository Mock
// ============================================

import type { UUID } from '../../types/common.types.js';
import type { PaginationParams, PaginatedResult } from '../../types/pagination.types.js';
import { paginateArray } from '../../utils/pagination.util.js';
import { generateUUID } from '../../utils/crypto.util.js';
import { NotFoundError } from '../../errors/not-found.error.js';

export interface MockRepository<T extends { id: UUID }> {
  items: T[];
  findById(id: UUID): Promise<T | null>;
  findAll(params?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: UUID, data: Partial<T>): Promise<T>;
  delete(id: UUID): Promise<void>;
  exists(id: UUID): Promise<boolean>;
  clear(): void;
  seed(items: T[]): void;
}

export function createMockRepository<T extends { id: UUID; createdAt?: unknown; updatedAt?: unknown }>(
  entityName: string = 'Entity'
): MockRepository<T> {
  const items: T[] = [];

  return {
    items,

    async findById(id: UUID): Promise<T | null> {
      return items.find((item) => item.id === id) ?? null;
    },

    async findAll(params?: PaginationParams): Promise<PaginatedResult<T>> {
      return paginateArray(items, params);
    },

    async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
      const now = new Date().toISOString();
      const newItem = {
        ...data,
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      } as T;
      items.push(newItem);
      return newItem;
    },

    async update(id: UUID, data: Partial<T>): Promise<T> {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundError(entityName, id);
      }
      
      const existingItem = items[index]!;
      const updatedItem = {
        ...existingItem,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      items[index] = updatedItem;
      return updatedItem;
    },

    async delete(id: UUID): Promise<void> {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new NotFoundError(entityName, id);
      }
      items.splice(index, 1);
    },

    async exists(id: UUID): Promise<boolean> {
      return items.some((item) => item.id === id);
    },

    clear(): void {
      items.length = 0;
    },

    seed(newItems: T[]): void {
      items.length = 0;
      items.push(...newItems);
    },
  };
}
