import { getRedis } from "../config/redis.js";
import {
  buildUrlCacheKey,
  CACHE_TTL_SECONDS,
} from "../constants/cache.constants.js";
import { logger } from "../utils/logger.js";

const serializeCachedUrl = (urlRecord) => ({
  id: urlRecord.id,
  originalUrl: urlRecord.originalUrl,
  shortCode: urlRecord.shortCode,
  expiresAt: urlRecord.expiresAt
    ? new Date(urlRecord.expiresAt).toISOString()
    : null,
});

const parseCachedUrl = (value) => {
  if (!value) return null;

  if (typeof value === "string")
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }

  return value;
};

export const getCachedUrl = async (shortCode) => {
  try {
    const redis = getRedis();
    const value = await redis.get(buildUrlCacheKey(shortCode));
    return parseCachedUrl(value);
  } catch (error) {
    logger.warn("Redis cache read failed", { message: error.message });
    return null;
  }
};

export const setCachedUrl = async (shortCode, urlRecord) => {
  try {
    const redis = getRedis();
    await redis.set(
      buildUrlCacheKey(shortCode),
      serializeCachedUrl(urlRecord),
      {
        ex: CACHE_TTL_SECONDS,
      },
    );
  } catch (error) {
    logger.warn("Redis cache write failed", { message: error.message });
  }
};

export const deleteCachedUrl = async (shortCode) => {
  if (!shortCode) return;

  try {
    const redis = getRedis();
    await redis.del(buildUrlCacheKey(shortCode));
  } catch (error) {
    logger.warn("Redis cache delete failed", { message: error.message });
  }
};

export const invalidateUrlCache = async (urlRecord) => {
  if (!urlRecord) return;

  const codes = new Set(
    [urlRecord.shortCode, urlRecord.customAlias]
      .filter(Boolean)
      .map((code) => code.toLowerCase()),
  );

  await Promise.all([...codes].map((code) => deleteCachedUrl(code)));
};
