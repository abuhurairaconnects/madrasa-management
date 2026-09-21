import Redis from "ioredis";

// Memory Fallback Cache Store
interface CacheItem {
  value: string;
  expiresAt: number | null;
}
const memoryStore = new Map<string, CacheItem>();

let redisClient: Redis | null = null;
let isRedisConnected = false;

try {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        return null; // Stop retrying and fall back gracefully
      }
      return Math.min(times * 100, 1000);
    },
    lazyConnect: true,
    connectTimeout: 2000,
  });

  redisClient.on("connect", () => {
    isRedisConnected = true;
    console.log("✅ Redis connected successfully");
  });

  redisClient.on("error", (err) => {
    isRedisConnected = false;
    // Log once without spamming
  });

  // Attempt initial connect
  redisClient.connect().catch(() => {
    isRedisConnected = false;
  });
} catch (e) {
  isRedisConnected = false;
}

/**
 * Get item from Cache (Redis or in-memory fallback)
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) return JSON.parse(data);
    } catch {
      // fallback to memory
    }
  }

  const item = memoryStore.get(key);
  if (!item) return null;
  if (item.expiresAt && item.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  try {
    return JSON.parse(item.value);
  } catch {
    return null;
  }
}

/**
 * Set item in Cache with TTL (default 60 seconds)
 */
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds: number = 60
): Promise<void> {
  const serialized = JSON.stringify(value);

  if (isRedisConnected && redisClient) {
    try {
      if (ttlSeconds > 0) {
        await redisClient.set(key, serialized, "EX", ttlSeconds);
      } else {
        await redisClient.set(key, serialized);
      }
      return;
    } catch {
      // fallback to memory
    }
  }

  memoryStore.set(key, {
    value: serialized,
    expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
  });
}

/**
 * Delete key or invalidate pattern
 */
export async function cacheDel(key: string): Promise<void> {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch {
      // ignore
    }
  }
  memoryStore.delete(key);
}

/**
 * Delete all keys matching a prefix
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // ignore
    }
  }

  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}

/**
 * Check cache status
 */
export function getCacheStatus(): {
  isConnected: boolean;
  mode: "REDIS" | "IN_MEMORY";
} {
  return {
    isConnected: isRedisConnected,
    mode: isRedisConnected ? "REDIS" : "IN_MEMORY",
  };
}
