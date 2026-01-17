import Redis from "ioredis";
import env from "@config/env";
import logger from "@config/logger";

let redis: Redis | null = null;

export function createRedisClient(): Redis {
  if (redis) return redis;

  redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,

    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,

    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis connection lost. Retrying to connect (#${times}) in ${delay}ms...`);
      return delay;
    },
  });
  redis.on("connect", () => {
    logger.info("Redis connected successfully.");
  });
  redis.on("error", (error) => {
    logger.error("Redis connection error:", error);
  });

  return redis;
}

export default redis = createRedisClient();
