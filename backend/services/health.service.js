import prisma from "../config/client.js";
import { checkRedisConnection } from "../config/redis.js";

const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};

const resolveStatus = (databaseConnected, redisConnected) => {
  if (databaseConnected && redisConnected) return "healthy";
  if (!databaseConnected && !redisConnected) return "unhealthy";
  return "degraded";
};

export const getHealthStatus = async () => {
  const [databaseConnected, redisConnected] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ]);

  return {
    status: resolveStatus(databaseConnected, redisConnected),
    database: databaseConnected ? "connected" : "disconnected",
    redis: redisConnected ? "connected" : "disconnected",
    uptime: Math.floor(process.uptime()),
  };
};
