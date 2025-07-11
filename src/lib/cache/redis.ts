// src/lib/cache/redis.ts
import { createClient } from 'redis';

// Local Redis client for VPS
let redis: any = null;

// Initialize local Redis client
if (process.env.REDIS_URL) {
  redis = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });
  
  // Connect to local Redis with error handling
  redis.connect().catch((error: unknown) => {
    console.error('Failed to connect to local Redis:', error);
    redis = null;
  });

  // Handle Redis connection events
  redis.on('error', (err: unknown) => {
    console.error('Redis Client Error:', err);
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully');
  });

  redis.on('ready', () => {
    console.log('✅ Redis client ready');
  });
} else {
  console.warn('⚠️ REDIS_URL not configured - running without cache');
}

export class CacheService {
  private static instance: CacheService;
  private defaultTTL = 300; // 5 minutes default

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Generic cache wrapper
  async cached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    try {
      if (redis) {
        // Try to get from Redis cache
        const result = await redis.get(key);
        if (result) {
          const cached: T = JSON.parse(result);
          return cached;
        }
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Store in cache (fire and forget)
    if (redis) {
      try {
        redis.setEx(key, ttl, JSON.stringify(fresh)).catch((error: unknown) => {
          console.error('Redis set error:', error);
        });
      } catch (error) {
        console.error('Redis set error:', error);
      }
    }

    return fresh;
  }

  // Invalidate cache
  async invalidate(pattern: string): Promise<void> {
    try {
      if (redis) {
        if (pattern.includes('*')) {
          // Pattern-based deletion using KEYS command
          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
            await redis.del(keys);
          }
        } else {
          await redis.del(pattern);
        }
      }
    } catch (error) {
      console.error('Redis invalidate error:', error);
    }
  }

  // Cache keys generator
  static keys = {
    listings: (params: Record<string, any>) => 
      `listings:${JSON.stringify(params)}`,
    listing: (id: string) => `listing:${id}`,
    categories: () => 'categories:all',
    filters: (dealType: string) => `filters:${dealType}`,
    propertyTypes: (categoryId: string) => `propertyTypes:${categoryId}`,
    filterOptions: (params: Record<string, any>) => 
      `filterOptions:${JSON.stringify(params)}`,
  };
}

export const cache = CacheService.getInstance(); 