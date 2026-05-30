import { Redis } from "@upstash/redis";
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from "./env.js";

let redisClient = null;

const createRedisClient = () =>
  new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });

export const getRedis = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

export const checkRedisConnection = async () => {
  try {
    const redis = getRedis();
    const result = await redis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
};
