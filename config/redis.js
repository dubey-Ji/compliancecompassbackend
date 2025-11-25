import { createClient } from "redis";
import config from "./config.js";
import logger from "../utils/logger.js";

let redisClient = null;

export const connectRedis = async () => {
  if (!config.redis.enable) {
    logger.warn("Redis is disabled in configuration");
    return null;
  }

  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
      database: config.redis.db,
    });

    redisClient.on("error", (err) => {
      logger.error("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      logger.info("Redis client connecting...");
    });

    redisClient.on("ready", () => {
      logger.info("Redis client ready");
    });

    redisClient.on("reconnecting", () => {
      logger.warn("Redis client reconnecting...");
    });

    await redisClient.connect();
    logger.info(
      `Redis connected to ${config.redis.host}:${config.redis.port} (DB: ${config.redis.db})`
    );

    return redisClient;
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    // Don't throw - allow app to continue without Redis (graceful degradation)
    return null;
  }
};

export const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info("Redis client disconnected");
      redisClient = null;
    } catch (error) {
      logger.error("Error disconnecting Redis:", error);
    }
  }
};

export const getRedisClient = () => {
  return redisClient;
};

export default redisClient;

