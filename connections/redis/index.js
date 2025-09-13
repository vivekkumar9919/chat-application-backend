const Redis = require("ioredis");
const { redisLogger } = require('../../utils/logger/index');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0, // optional
});

redisClient.on("connect", () => {
  redisLogger.info("Connected to Redis", { host: process.env.REDIS_HOST || "127.0.0.1", port: process.env.REDIS_PORT || 6379 });
});

redisClient.on("error", (err) => {
  redisLogger.error("Redis connection error", { error: err.message, stack: err.stack });
});

module.exports = redisClient;
