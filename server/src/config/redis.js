const { Redis } = require("ioredis");

let redis;

const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.error("Redis error:", err));
  }
  return redis;
};

module.exports = { getRedis };