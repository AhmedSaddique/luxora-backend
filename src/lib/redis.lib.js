import Redis from "ioredis";

import { env } from "#config/index.js";
import { logger } from "./logger.lib.js";

const { REDIS_URL } = env;

// Only create a client if a URL is configured. A bad/unreachable server is
// handled gracefully — commands reject immediately and we fall back to memory.
export const redis = REDIS_URL
  ? new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      retryStrategy: () => null,
      reconnectOnError: () => false,
    })
  : null;

if (redis) {
  redis.on("connect", () => logger.info("[redis] connected"));
  redis.on("error", (err) =>
    logger.warn(`[redis] unavailable: ${err.code || err.message}`),
  );
}

// In-memory fallback so caching works even without a running Redis.
const memoryCache = new Map();

const fallback = {
  get(key) {
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  },
  set(key, value, ttl) {
    memoryCache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  },
  del(key) {
    memoryCache.delete(key);
  },
};

export const cache = {
  async get(key) {
    try {
      if (redis) {
        const value = await redis.get(key);
        if (value) return JSON.parse(value);
      }
    } catch {
      /* fall through to memory */
    }
    return fallback.get(key);
  },

  async set(key, value, ttlSeconds = 120) {
    fallback.set(key, value, ttlSeconds);
    try {
      if (redis) await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      /* ignore — memory cache already set */
    }
  },

  async del(key) {
    fallback.del(key);
    try {
      if (redis) await redis.del(key);
    } catch {
      /* ignore */
    }
  },
};
