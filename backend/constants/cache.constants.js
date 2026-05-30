export const CACHE_KEY_PREFIX = "url:";
export const CACHE_TTL_SECONDS = 86400;

export const buildUrlCacheKey = (shortCode) =>
  `${CACHE_KEY_PREFIX}${shortCode.toLowerCase()}`;
