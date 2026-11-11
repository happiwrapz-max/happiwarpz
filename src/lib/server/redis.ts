import { Redis as UpstashRedis } from "@upstash/redis";
import IORedis from "ioredis";

// Global cache metrics
let cacheHits = 0;
let cacheMisses = 0;

// In-Memory Fallback Store with TTL expiration
interface MemoryCacheItem {
  value: string;
  expiresAt: number | null;
}
const memoryStore = new Map<string, MemoryCacheItem>();

// Clean up expired items periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, item] of memoryStore.entries()) {
      if (item.expiresAt !== null && item.expiresAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, 60 * 1000).unref();
}

// -------------------------------------------------------------
// 1. Upstash Redis (REST HTTP Client - Serverless / Edge Native)
// -------------------------------------------------------------
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let upstashClient: UpstashRedis | null = null;
let isUpstashAvailable = false;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  try {
    upstashClient = new UpstashRedis({
      url: UPSTASH_URL,
      token: UPSTASH_TOKEN,
    });
    isUpstashAvailable = true;
  } catch (err: any) {
    console.warn("Upstash Redis initialization warning:", err.message);
    upstashClient = null;
    isUpstashAvailable = false;
  }
}

// -------------------------------------------------------------
// 2. ioredis TCP Client (Fallback for standalone Redis instances)
// -------------------------------------------------------------
const REDIS_URL = process.env.REDIS_URL || process.env.KV_URL || "";
let ioRedisClient: IORedis | null = null;
let isIoRedisAvailable = false;

if (!isUpstashAvailable && REDIS_URL) {
  try {
    ioRedisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    });

    ioRedisClient.on("connect", () => {
      isIoRedisAvailable = true;
    });

    ioRedisClient.on("error", () => {
      isIoRedisAvailable = false;
    });

    ioRedisClient.connect().catch(() => {
      isIoRedisAvailable = false;
    });
  } catch {
    ioRedisClient = null;
    isIoRedisAvailable = false;
  }
}

/**
 * Key prefix helper
 */
const PREFIX = "happiwrapz:";
function formatKey(key: string): string {
  return key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;
}

/**
 * Production Redis & Fallback In-Memory Caching Engine
 */
export const redisCache = {
  /**
   * Retrieves a cached value, automatically parsed from JSON.
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = formatKey(key);

    // 1. Try Upstash Redis (REST HTTP)
    if (upstashClient && isUpstashAvailable) {
      try {
        const raw = await upstashClient.get<T>(fullKey);
        if (raw !== null && raw !== undefined) {
          cacheHits++;
          if (typeof raw === "string") {
            try {
              return JSON.parse(raw) as T;
            } catch {
              return raw as unknown as T;
            }
          }
          return raw;
        }
        cacheMisses++;
        return null;
      } catch (err) {
        console.warn("Upstash cache read error, falling back:", err);
      }
    }

    // 2. Try ioredis TCP
    if (ioRedisClient && isIoRedisAvailable) {
      try {
        const raw = await ioRedisClient.get(fullKey);
        if (raw !== null) {
          cacheHits++;
          return JSON.parse(raw) as T;
        }
        cacheMisses++;
        return null;
      } catch {
        isIoRedisAvailable = false;
      }
    }

    // 3. Fallback to In-Memory
    const item = memoryStore.get(fullKey);
    if (!item) {
      cacheMisses++;
      return null;
    }

    if (item.expiresAt !== null && item.expiresAt <= Date.now()) {
      memoryStore.delete(fullKey);
      cacheMisses++;
      return null;
    }

    cacheHits++;
    try {
      return JSON.parse(item.value) as T;
    } catch {
      return item.value as unknown as T;
    }
  },

  /**
   * Sets a value in the cache with an optional TTL in seconds.
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const fullKey = formatKey(key);
    const jsonStr = JSON.stringify(value);

    // 1. Set in Upstash Redis
    if (upstashClient && isUpstashAvailable) {
      try {
        if (ttlSeconds > 0) {
          await upstashClient.set(fullKey, jsonStr, { ex: ttlSeconds });
        } else {
          await upstashClient.set(fullKey, jsonStr);
        }
      } catch (err) {
        console.warn("Upstash cache set error, fallback to memory:", err);
      }
    }

    // 2. Set in ioredis TCP if active
    if (ioRedisClient && isIoRedisAvailable) {
      try {
        if (ttlSeconds > 0) {
          await ioRedisClient.set(fullKey, jsonStr, "EX", ttlSeconds);
        } else {
          await ioRedisClient.set(fullKey, jsonStr);
        }
      } catch {
        isIoRedisAvailable = false;
      }
    }

    // 3. Always maintain in-memory store as fast layer-1 cache / fallback
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    memoryStore.set(fullKey, { value: jsonStr, expiresAt });
  },

  /**
   * Increments a counter key atomically and sets TTL if newly created. Returns new count.
   */
  async incr(key: string, ttlSeconds: number = 60): Promise<number> {
    const fullKey = formatKey(key);

    // 1. Upstash Redis
    if (upstashClient && isUpstashAvailable) {
      try {
        const val = await upstashClient.incr(fullKey);
        if (val === 1 && ttlSeconds > 0) {
          await upstashClient.expire(fullKey, ttlSeconds);
        }
        return val;
      } catch (err) {
        console.warn("Upstash incr error, falling back to memory:", err);
      }
    }

    // 2. ioredis TCP
    if (ioRedisClient && isIoRedisAvailable) {
      try {
        const val = await ioRedisClient.incr(fullKey);
        if (val === 1 && ttlSeconds > 0) {
          await ioRedisClient.expire(fullKey, ttlSeconds);
        }
        return val;
      } catch {
        isIoRedisAvailable = false;
      }
    }

    // 3. In-memory counter fallback
    const now = Date.now();
    const item = memoryStore.get(fullKey);
    let count = 1;
    if (item && (item.expiresAt === null || item.expiresAt > now)) {
      count = (parseInt(item.value, 10) || 0) + 1;
    }
    const expiresAt = now + ttlSeconds * 1000;
    memoryStore.set(fullKey, { value: String(count), expiresAt });
    return count;
  },

  /**
   * Deletes a specific key or list of keys from the cache.
   */
  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key.map(formatKey) : [formatKey(key)];

    if (upstashClient && isUpstashAvailable) {
      try {
        await upstashClient.del(...keys);
      } catch (err) {
        console.warn("Upstash del error:", err);
      }
    }

    if (ioRedisClient && isIoRedisAvailable) {
      try {
        await ioRedisClient.del(...keys);
      } catch {
        isIoRedisAvailable = false;
      }
    }

    for (const k of keys) {
      memoryStore.delete(k);
      if (k.startsWith(PREFIX)) {
        memoryStore.delete(k.substring(PREFIX.length));
      }
    }
  },

  /**
   * Deletes all keys matching a specific pattern (e.g. "catalog:*").
   */
  async delPattern(pattern: string): Promise<number> {
    const fullPattern = formatKey(pattern);
    let deletedCount = 0;

    // 1. Upstash Redis pattern deletion
    if (upstashClient && isUpstashAvailable) {
      try {
        const matchingKeys = await upstashClient.keys(fullPattern);
        if (matchingKeys.length > 0) {
          deletedCount = await upstashClient.del(...matchingKeys);
        }
      } catch (err) {
        console.warn("Upstash delPattern error:", err);
      }
    }

    // 2. ioredis pattern deletion using SCAN
    if (ioRedisClient && isIoRedisAvailable) {
      try {
        const stream = ioRedisClient.scanStream({
          match: fullPattern,
          count: 50,
        });

        const keysToDelete: string[] = [];
        for await (const resultKeys of stream) {
          if (resultKeys.length > 0) {
            keysToDelete.push(...resultKeys);
          }
        }

        if (keysToDelete.length > 0) {
          deletedCount = Math.max(deletedCount, await ioRedisClient.del(...keysToDelete));
        }
      } catch {
        isIoRedisAvailable = false;
      }
    }

    // 3. In-Memory pattern deletion
    const regex = new RegExp("^" + fullPattern.replace(/\*/g, ".*") + "$");
    for (const k of memoryStore.keys()) {
      if (regex.test(k)) {
        memoryStore.delete(k);
        deletedCount++;
      }
    }

    return deletedCount;
  },

  /**
   * Helper: Retrieves cached value or runs fetcher and caches the result.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  },

  /**
   * Flushes all application keys from cache.
   */
  async flushAll(): Promise<void> {
    await this.delPattern("*");
    memoryStore.clear();
  },

  /**
   * Returns live diagnostic statistics about the caching system.
   */
  async getStats(): Promise<{
    provider: "upstash-redis" | "ioredis" | "in-memory-fallback";
    endpoint: string;
    connected: boolean;
    redisUrlConfigured: boolean;
    hits: number;
    misses: number;
    hitRate: string;
    keysCount: number;
    cachedKeysSample: string[];
  }> {
    const totalRequests = cacheHits + cacheMisses;
    const hitRate = totalRequests > 0 ? `${((cacheHits / totalRequests) * 100).toFixed(1)}%` : "0.0%";

    let keysCount = memoryStore.size;
    let sampleKeys: string[] = Array.from(memoryStore.keys()).slice(0, 10);
    let provider: "upstash-redis" | "ioredis" | "in-memory-fallback" = "in-memory-fallback";
    let endpoint = "Local Memory Cache";

    if (upstashClient && isUpstashAvailable) {
      try {
        const infoKeys = await upstashClient.keys(`${PREFIX}*`);
        keysCount = infoKeys.length;
        sampleKeys = infoKeys.slice(0, 10);
        provider = "upstash-redis";
        endpoint = UPSTASH_URL.replace("https://", "");
      } catch {
        // Fallback to memory values
      }
    } else if (ioRedisClient && isIoRedisAvailable) {
      try {
        const infoKeys = await ioRedisClient.keys(`${PREFIX}*`);
        keysCount = infoKeys.length;
        sampleKeys = infoKeys.slice(0, 10);
        provider = "ioredis";
        endpoint = REDIS_URL.replace(/:[^:@]*@/, ":***@");
      } catch {
        // Fallback to memory values
      }
    }

    return {
      provider,
      endpoint,
      connected: isUpstashAvailable || isIoRedisAvailable || true,
      redisUrlConfigured: !!(UPSTASH_URL || REDIS_URL),
      hits: cacheHits,
      misses: cacheMisses,
      hitRate,
      keysCount,
      cachedKeysSample: sampleKeys,
    };
  },
};
