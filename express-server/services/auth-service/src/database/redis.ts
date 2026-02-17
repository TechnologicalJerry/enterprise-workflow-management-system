// ============================================
// Redis Client
// ============================================

import Redis from 'ioredis';
import { redisConfig, redisKeyPrefixes } from '../config/redis.config.js';
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

// Health check
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch {
    return false;
  }
};

// Token blacklist operations
export const tokenBlacklist = {
  async add(token: string, expiresInSeconds: number): Promise<void> {
    const key = `${redisKeyPrefixes.tokenBlacklist}${token}`;
    await redisClient.setex(key, expiresInSeconds, '1');
  },

  async isBlacklisted(token: string): Promise<boolean> {
    const key = `${redisKeyPrefixes.tokenBlacklist}${token}`;
    const result = await redisClient.get(key);
    return result !== null;
  },
};

// Session cache operations
export const sessionCache = {
  async set(sessionId: string, data: object, expiresInSeconds: number): Promise<void> {
    const key = `${redisKeyPrefixes.session}${sessionId}`;
    await redisClient.setex(key, expiresInSeconds, JSON.stringify(data));
  },

  async get<T>(sessionId: string): Promise<T | null> {
    const key = `${redisKeyPrefixes.session}${sessionId}`;
    const result = await redisClient.get(key);
    return result ? JSON.parse(result) : null;
  },

  async delete(sessionId: string): Promise<void> {
    const key = `${redisKeyPrefixes.session}${sessionId}`;
    await redisClient.del(key);
  },

  async deleteUserSessions(userId: string): Promise<void> {
    const pattern = `${redisKeyPrefixes.session}*:${userId}`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  },
};
