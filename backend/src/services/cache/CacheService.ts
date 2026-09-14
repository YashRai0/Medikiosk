import { redisClient, isRedisConnected } from '../../config/redis';

const inMemoryCache = new Map<string, { value: string; expiry: number }>();

export const CacheService = {
  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    if (isRedisConnected && redisClient) {
      await redisClient.setex(key, ttlSeconds, value);
    } else {
      inMemoryCache.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 });
    }
  },
  async get(key: string): Promise<string | null> {
    if (isRedisConnected && redisClient) {
      return redisClient.get(key);
    } else {
      const item = inMemoryCache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        inMemoryCache.delete(key);
        return null;
      }
      return item.value;
    }
  },
  async del(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    } else {
      inMemoryCache.delete(key);
    }
  }
};
