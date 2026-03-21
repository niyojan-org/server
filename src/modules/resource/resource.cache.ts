import { createRedisClient } from "@config/redis";
import { REDIS_KEYS } from "@config/redis.keys";
import logger from "@config/logger";
import { Resource } from "./resource.types";

const redisClient = createRedisClient();

const CACHE_TTL = 3600; // 1 hour

/**
 * Cache resource by ID
 */
export async function cacheResource(resourceId: string, resource: Resource): Promise<void> {
  try {
    const key = `${REDIS_KEYS.RESOURCE}:${resourceId}`;
    await redisClient.setex(key, CACHE_TTL, JSON.stringify(resource));
  } catch (error) {
    logger.error("Error caching resource:", error);
  }
}

/**
 * Get cached resource by ID
 */
export async function getCachedResource(resourceId: string): Promise<Resource | null> {
  try {
    const key = `${REDIS_KEYS.RESOURCE}:${resourceId}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logger.error("Error getting cached resource:", error);
    return null;
  }
}

/**
 * Cache resources list
 */
export async function cacheResourcesList(
  cacheKey: string,
  resources: Resource[],
  ttl: number = CACHE_TTL
): Promise<void> {
  try {
    await redisClient.setex(cacheKey, ttl, JSON.stringify(resources));
  } catch (error) {
    logger.error("Error caching resources list:", error);
  }
}

/**
 * Get cached resources list
 */
export async function getCachedResourcesList(cacheKey: string): Promise<Resource[] | null> {
  try {
    const cached = await redisClient.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    logger.error("Error getting cached resources list:", error);
    return null;
  }
}

/**
 * Invalidate resource cache
 */
export async function invalidateResourceCache(resourceId: string): Promise<void> {
  try {
    const key = `${REDIS_KEYS.RESOURCE}:${resourceId}`;
    await redisClient.del(key);
  } catch (error) {
    logger.error("Error invalidating resource cache:", error);
  }
}

/**
 * Clear all resource caches (organization/event/user specific)
 */
export async function clearResourceCaches(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(`${REDIS_KEYS.RESOURCE}:${pattern}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    logger.error("Error clearing resource caches:", error);
  }
}

/**
 * Increment view count in cache
 */
export async function incrementViewCount(resourceId: string): Promise<void> {
  try {
    const key = `${REDIS_KEYS.RESOURCE}:views:${resourceId}`;
    await redisClient.incr(key);
    await redisClient.expire(key, 86400); // 24 hours
  } catch (error) {
    logger.error("Error incrementing view count:", error);
  }
}

/**
 * Get view count from cache
 */
export async function getViewCount(resourceId: string): Promise<number> {
  try {
    const key = `${REDIS_KEYS.RESOURCE}:views:${resourceId}`;
    const count = await redisClient.get(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    logger.error("Error getting view count:", error);
    return 0;
  }
}
