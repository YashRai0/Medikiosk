import Redis from 'ioredis';
import { config } from './env';

export let isRedisConnected = false;
export let redisClient: Redis | null = null;

export const connectRedis = () => {
  try {
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
         console.warn('Redis connection lost. Using in-memory fallback.', err.message);
      }
      isRedisConnected = false;
    });
  } catch (error) {
    console.warn('Redis setup failed. Using in-memory fallback.', error);
    isRedisConnected = false;
  }
};
