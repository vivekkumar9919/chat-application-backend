const Redis = require("ioredis");

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0, // optional
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis (ioredis)");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

module.exports = redisClient;
