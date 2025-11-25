import { getRedisClient } from "../config/redis.js";
import config from "../config/config.js";
import logger from "./logger.js";

/**
 * Extensible cache service with Redis backend
 * Supports namespacing for different cache types
 */
class CacheService {
  constructor() {
    this.redisClient = null;
    this.prefix = config.redis.keyPrefix;
    this.enabled = config.redis.enable;
  }

  /**
   * Initialize the cache service with Redis client
   */
  init(redisClient) {
    this.redisClient = redisClient;
  }

  /**
   * Build full cache key with namespace and prefix
   * @param {string} namespace - Cache namespace (e.g., 'onboarding', 'catalog')
   * @param {string} key - Cache key
   * @returns {string} Full cache key
   */
  buildKey(namespace, key) {
    return `${this.prefix}${namespace}:${key}`;
  }

  /**
   * Get value from cache
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} Cached value or null
   */
  async get(namespace, key) {
    if (!this.enabled || !this.redisClient) {
      return null;
    }

    try {
      const fullKey = this.buildKey(namespace, key);
      const value = await this.redisClient.get(fullKey);

      if (value === null) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      logger.error(`Cache get error for ${namespace}:${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number|null} ttlSeconds - Time to live in seconds (null = no expiration)
   * @returns {Promise<boolean>} Success status
   */
  async set(namespace, key, value, ttlSeconds = null) {
    if (!this.enabled || !this.redisClient) {
      return false;
    }

    try {
      const fullKey = this.buildKey(namespace, key);
      const serialized = JSON.stringify(value);

      if (ttlSeconds && ttlSeconds > 0) {
        await this.redisClient.setEx(fullKey, ttlSeconds, serialized);
      } else {
        await this.redisClient.set(fullKey, serialized);
      }

      return true;
    } catch (error) {
      logger.error(`Cache set error for ${namespace}:${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(namespace, key) {
    if (!this.enabled || !this.redisClient) {
      return false;
    }

    try {
      const fullKey = this.buildKey(namespace, key);
      await this.redisClient.del(fullKey);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for ${namespace}:${key}:`, error);
      return false;
    }
  }

  /**
   * Delete all keys in a namespace
   * Note: Uses KEYS command which blocks Redis. For production with large datasets,
   * consider using SCAN for non-blocking iteration.
   * @param {string} namespace - Cache namespace
   * @returns {Promise<number>} Number of keys deleted
   */
  async clearNamespace(namespace) {
    if (!this.enabled || !this.redisClient) {
      return 0;
    }

    try {
      const pattern = this.buildKey(namespace, "*");
      const keys = await this.redisClient.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      const deleted = await this.redisClient.del(keys);
      return deleted;
    } catch (error) {
      logger.error(`Cache clear namespace error for ${namespace}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache keys (use with caution)
   * Note: Uses KEYS command which blocks Redis. For production with large datasets,
   * consider using SCAN for non-blocking iteration.
   * @returns {Promise<number>} Number of keys deleted
   */
  async clear() {
    if (!this.enabled || !this.redisClient) {
      return 0;
    }

    try {
      const pattern = `${this.prefix}*`;
      const keys = await this.redisClient.keys(pattern);

      if (keys.length === 0) {
        return 0;
      }

      const deleted = await this.redisClient.del(keys);
      return deleted;
    } catch (error) {
      logger.error("Cache clear error:", error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if key exists
   */
  async exists(namespace, key) {
    if (!this.enabled || !this.redisClient) {
      return false;
    }

    try {
      const fullKey = this.buildKey(namespace, key);
      const result = await this.redisClient.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for ${namespace}:${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @returns {Promise<number|null>} TTL in seconds, -1 if no expiration, null if key doesn't exist
   */
  async getTTL(namespace, key) {
    if (!this.enabled || !this.redisClient) {
      return null;
    }

    try {
      const fullKey = this.buildKey(namespace, key);
      const ttl = await this.redisClient.ttl(fullKey);
      return ttl === -2 ? null : ttl; // -2 means key doesn't exist
    } catch (error) {
      logger.error(`Cache TTL error for ${namespace}:${key}:`, error);
      return null;
    }
  }

  /**
   * Increment a numeric value (useful for counters, rate limiting, etc.)
   * @param {string} namespace - Cache namespace
   * @param {string} key - Cache key
   * @param {number} increment - Amount to increment (default: 1)
   * @returns {Promise<number>} New value after increment
   */
  async increment(namespace, key, increment = 1) {
    if (!this.enabled || !this.redisClient) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(namespace, key);
      return await this.redisClient.incrBy(fullKey, increment);
    } catch (error) {
      logger.error(`Cache increment error for ${namespace}:${key}:`, error);
      return 0;
    }
  }

  /**
   * Set multiple key-value pairs (MSET)
   * @param {string} namespace - Cache namespace
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number|null} ttlSeconds - Optional TTL for all keys
   * @returns {Promise<boolean>} Success status
   */
  async mset(namespace, keyValuePairs, ttlSeconds = null) {
    if (!this.enabled || !this.redisClient) {
      return false;
    }

    try {
      const pipeline = this.redisClient.multi();
      const prefix = this.prefix + namespace + ":";

      for (const [key, value] of Object.entries(keyValuePairs)) {
        const fullKey = prefix + key;
        const serialized = JSON.stringify(value);

        if (ttlSeconds && ttlSeconds > 0) {
          pipeline.setEx(fullKey, ttlSeconds, serialized);
        } else {
          pipeline.set(fullKey, serialized);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error(`Cache mset error for ${namespace}:`, error);
      return false;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Convenience functions for backward compatibility and ease of use
export const get = (namespace, key) => cacheService.get(namespace, key);
export const set = (namespace, key, value, ttlSeconds = null) =>
  cacheService.set(namespace, key, value, ttlSeconds);
export const del = (namespace, key) => cacheService.del(namespace, key);
export const clearNamespace = (namespace) =>
  cacheService.clearNamespace(namespace);
export const clear = () => cacheService.clear();
export const exists = (namespace, key) => cacheService.exists(namespace, key);
export const getTTL = (namespace, key) => cacheService.getTTL(namespace, key);
export const increment = (namespace, key, increment = 1) =>
  cacheService.increment(namespace, key, increment);
export const mset = (namespace, keyValuePairs, ttlSeconds = null) =>
  cacheService.mset(namespace, keyValuePairs, ttlSeconds);

// Initialize cache service (call this after Redis connection is established)
export const initCache = (redisClient) => {
  cacheService.init(redisClient);
};

// Export the service instance for advanced usage
export default cacheService;
