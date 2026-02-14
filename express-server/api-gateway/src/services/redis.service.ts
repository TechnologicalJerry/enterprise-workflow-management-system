// ============================================
// Redis Service
// ============================================

import Redis from 'ioredis';
import { redisConfig } from '../config/redis.config.js';
import { logger } from '../utils/logger.js';

// Create Redis client
export const redisClient = new Redis(redisConfig);

// Connection event handlers
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (error) => {
  logger.error('Redis client error', { error: error.message });
});

redisClient.on('close', () => {
  logger.warn('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    // If already connected, connect() throws an error
    if (redisClient.status === 'ready') {
      return;
    }
    throw error;
  }
};

// Disconnect from Redis
export const disconnectRedis = async (): Promise<void> => {
  await redisClient.quit();
};

// Redis helper functions
export const redisHelpers = {
  // Set with expiration
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await redisClient.setex(key, seconds, value);
  },

  // Get value
  async get(key: string): Promise<string | null> {
    return redisClient.get(key);
  },

  // Delete key
  async del(key: string): Promise<void> {
    await redisClient.del(key);
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await redisClient.exists(key);
    return result === 1;
  },

  // Set expiration on existing key
  async expire(key: string, seconds: number): Promise<void> {
    await redisClient.expire(key, seconds);
  },

  // Get TTL of key
  async ttl(key: string): Promise<number> {
    return redisClient.ttl(key);
  },

  // Increment counter
  async incr(key: string): Promise<number> {
    return redisClient.incr(key);
  },

  // Set hash field
  async hset(key: string, field: string, value: string): Promise<void> {
    await redisClient.hset(key, field, value);
  },

  // Get hash field
  async hget(key: string, field: string): Promise<string | null> {
    return redisClient.hget(key, field);
  },

  // Get all hash fields
  async hgetall(key: string): Promise<Record<string, string>> {
    return redisClient.hgetall(key);
  },

  // Delete hash field
  async hdel(key: string, field: string): Promise<void> {
    await redisClient.hdel(key, field);
  },

  // Add to set
  async sadd(key: string, member: string): Promise<void> {
    await redisClient.sadd(key, member);
  },

  // Remove from set
  async srem(key: string, member: string): Promise<void> {
    await redisClient.srem(key, member);
  },

  // Check if member exists in set
  async sismember(key: string, member: string): Promise<boolean> {
    const result = await redisClient.sismember(key, member);
    return result === 1;
  },

  // Get all set members
  async smembers(key: string): Promise<string[]> {
    return redisClient.smembers(key);
  },

  // Delete keys by pattern
  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  },
};
