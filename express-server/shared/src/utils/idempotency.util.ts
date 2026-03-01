// ============================================
// Idempotency Utility
// ============================================

import { createIdempotencyHash } from './crypto.util.js';

export interface IdempotencyConfig {
  headerName: string;
  ttlSeconds: number;
  keyPrefix: string;
}

export const DEFAULT_IDEMPOTENCY_CONFIG: IdempotencyConfig = {
  headerName: 'Idempotency-Key',
  ttlSeconds: 86400, // 24 hours
  keyPrefix: 'idempotency:',
};

export interface IdempotencyResult<T> {
  cached: boolean;
  result: T;
  key: string;
}

export interface IdempotencyStore {
  get<T>(key: string): Promise<IdempotencyCachedResult<T> | null>;
  set<T>(key: string, result: IdempotencyCachedResult<T>, ttlSeconds: number): Promise<void>;
  lock(key: string, ttlSeconds: number): Promise<boolean>;
  unlock(key: string): Promise<void>;
}

export interface IdempotencyCachedResult<T> {
  statusCode: number;
  headers: Record<string, string>;
  body: T;
  createdAt: string;
}

/**
 * Generates an idempotency key from request data
 */
export function generateIdempotencyKey(
  method: string,
  path: string,
  body: Record<string, unknown>,
  userId?: string
): string {
  const data = {
    method,
    path,
    body,
    userId,
  };
  return createIdempotencyHash(data);
}

/**
 * Validates idempotency key format
 */
export function isValidIdempotencyKey(key: string): boolean {
  // Allow UUIDs or alphanumeric strings up to 255 chars
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const alphanumericRegex = /^[a-zA-Z0-9_-]{1,255}$/;
  
  return uuidRegex.test(key) || alphanumericRegex.test(key);
}

/**
 * Creates full cache key with prefix
 */
export function createIdempotencyCacheKey(
  key: string,
  config: IdempotencyConfig = DEFAULT_IDEMPOTENCY_CONFIG
): string {
  return `${config.keyPrefix}${key}`;
}

/**
 * Extracts idempotency key from request headers
 */
export function extractIdempotencyKey(
  headers: Record<string, string | string[] | undefined>,
  config: IdempotencyConfig = DEFAULT_IDEMPOTENCY_CONFIG
): string | null {
  const headerValue = headers[config.headerName.toLowerCase()];
  
  if (!headerValue) {
    return null;
  }

  const key = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  
  if (!key || !isValidIdempotencyKey(key)) {
    return null;
  }

  return key;
}

/**
 * Creates an in-memory idempotency store (for testing/development)
 */
export function createInMemoryIdempotencyStore(): IdempotencyStore {
  const cache = new Map<string, { value: IdempotencyCachedResult<unknown>; expiresAt: number }>();
  const locks = new Set<string>();

  return {
    async get<T>(key: string): Promise<IdempotencyCachedResult<T> | null> {
      const entry = cache.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
      }
      return entry.value as IdempotencyCachedResult<T>;
    },

    async set<T>(key: string, result: IdempotencyCachedResult<T>, ttlSeconds: number): Promise<void> {
      cache.set(key, {
        value: result,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    },

    async lock(key: string, _ttlSeconds: number): Promise<boolean> {
      if (locks.has(key)) return false;
      locks.add(key);
      return true;
    },

    async unlock(key: string): Promise<void> {
      locks.delete(key);
    },
  };
}
