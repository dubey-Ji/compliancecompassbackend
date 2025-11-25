import config from "../config/config.js";

export const defaultJobOptions = {
  removeOnComplete: 100,
  removeOnFail: 50,
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 30000,
  },
};

export const getRedisConnection = () => {
  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  };
};

