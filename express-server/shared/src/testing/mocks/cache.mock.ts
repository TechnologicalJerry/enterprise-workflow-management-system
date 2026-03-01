// ============================================
// Cache Mock
// ============================================

import type { ICache } from '../../interfaces/cache.interface.js';

export function createMockCache(): ICache & { store: Map<string, { value: unknown; expiresAt?: number }> } {
  const store = new Map<string, { value: unknown; expiresAt?: number }>();

  const cache: ICache & { store: typeof store } = {
    store,
    
    async get<T>(key: string): Promise<T | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value as T;
    },

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
      store.set(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      });
    },

    async delete(key: string): Promise<void> {
      store.delete(key);
    },

    async exists(key: string): Promise<boolean> {
      const entry = store.get(key);
      if (!entry) return false;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return false;
      }
      return true;
    },

    async ttl(key: string): Promise<number> {
      const entry = store.get(key);
      if (!entry?.expiresAt) return -1;
      const remaining = Math.floor((entry.expiresAt - Date.now()) / 1000);
      return remaining > 0 ? remaining : -1;
    },

    async expire(key: string, ttlSeconds: number): Promise<void> {
      const entry = store.get(key);
      if (entry) {
        entry.expiresAt = Date.now() + ttlSeconds * 1000;
      }
    },

    async increment(key: string, amount: number = 1): Promise<number> {
      const current = await cache.get<number>(key) ?? 0;
      const newValue = current + amount;
      await cache.set(key, newValue);
      return newValue;
    },

    async decrement(key: string, amount: number = 1): Promise<number> {
      return cache.increment(key, -amount);
    },
  };

  return cache;
}
