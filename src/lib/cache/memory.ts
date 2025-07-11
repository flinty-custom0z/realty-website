// src/lib/cache/memory.ts
// Fallback in-memory cache for development or when Redis is unavailable
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + (ttlSeconds * 1000),
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

// Export memory cache as fallback
export const memoryCache = new MemoryCache();

// Clean up expired entries every 5 minutes
setInterval(() => {
  memoryCache.cleanup();
}, 5 * 60 * 1000); 