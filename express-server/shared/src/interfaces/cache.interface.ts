// ============================================
// Cache Interface
// ============================================

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  increment(key: string, amount?: number): Promise<number>;
  decrement(key: string, amount?: number): Promise<number>;
}

export interface IHashCache {
  hget<T>(key: string, field: string): Promise<T | null>;
  hset<T>(key: string, field: string, value: T): Promise<void>;
  hgetall<T>(key: string): Promise<Record<string, T> | null>;
  hsetall<T>(key: string, data: Record<string, T>): Promise<void>;
  hdel(key: string, ...fields: string[]): Promise<number>;
  hexists(key: string, field: string): Promise<boolean>;
}

export interface ISetCache {
  sadd(key: string, ...members: string[]): Promise<number>;
  srem(key: string, ...members: string[]): Promise<number>;
  smembers(key: string): Promise<string[]>;
  sismember(key: string, member: string): Promise<boolean>;
  scard(key: string): Promise<number>;
}

export interface IListCache {
  lpush(key: string, ...values: string[]): Promise<number>;
  rpush(key: string, ...values: string[]): Promise<number>;
  lpop(key: string): Promise<string | null>;
  rpop(key: string): Promise<string | null>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  llen(key: string): Promise<number>;
}

export interface ISortedSetCache {
  zadd(key: string, score: number, member: string): Promise<number>;
  zrem(key: string, ...members: string[]): Promise<number>;
  zrange(key: string, start: number, stop: number): Promise<string[]>;
  zrangebyscore(key: string, min: number, max: number): Promise<string[]>;
  zscore(key: string, member: string): Promise<number | null>;
  zcard(key: string): Promise<number>;
}

export interface IDistributedLock {
  acquire(resource: string, ttlMs: number): Promise<LockHandle | null>;
  release(handle: LockHandle): Promise<boolean>;
  extend(handle: LockHandle, ttlMs: number): Promise<boolean>;
}

export interface LockHandle {
  resource: string;
  value: string;
  validity: number;
}

export interface ICacheWithPattern extends ICache {
  keys(pattern: string): Promise<string[]>;
  deleteByPattern(pattern: string): Promise<number>;
}

export interface ICacheable<T> {
  getCacheKey(): string;
  getCacheTTL(): number;
  serialize(): string;
  deserialize(data: string): T;
}

export type CacheStrategy = 'cache-first' | 'network-first' | 'cache-only' | 'network-only';

export interface CacheOptions {
  ttlSeconds?: number;
  strategy?: CacheStrategy;
  tags?: string[];
}
