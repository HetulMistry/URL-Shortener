import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildUrlCacheKey,
  CACHE_KEY_PREFIX,
  CACHE_TTL_SECONDS,
} from "../../constants/cache.constants.js";

const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

vi.mock("../../config/redis.js", () => ({
  getRedis: () => redisMock,
}));

vi.mock("../../utils/logger.js", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const { getCachedUrl, setCachedUrl, deleteCachedUrl, invalidateUrlCache } =
  await import("../../services/cache.service.js");

describe("cache service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds cache keys with prefix", () => {
    expect(buildUrlCacheKey("GitHub")).toBe(`${CACHE_KEY_PREFIX}github`);
    expect(CACHE_TTL_SECONDS).toBe(86400);
  });

  it("reads cached url values", async () => {
    redisMock.get.mockResolvedValue({ id: "1" });
    const result = await getCachedUrl("abc");
    expect(result).toEqual({ id: "1" });
  });

  it("returns null when redis read fails", async () => {
    redisMock.get.mockRejectedValue(new Error("redis down"));
    const result = await getCachedUrl("abc");
    expect(result).toBeNull();
  });

  it("writes cached url values with ttl", async () => {
    await setCachedUrl("abc", {
      id: "1",
      originalUrl: "https://example.com",
      shortCode: "abc",
      expiresAt: null,
    });

    expect(redisMock.set).toHaveBeenCalledWith(
      buildUrlCacheKey("abc"),
      expect.objectContaining({ id: "1" }),
      { ex: CACHE_TTL_SECONDS },
    );
  });

  it("invalidates all alias cache keys", async () => {
    await invalidateUrlCache({
      shortCode: "abc",
      customAlias: "alias",
    });

    expect(redisMock.del).toHaveBeenCalledTimes(2);
  });

  it("deletes a single cache key", async () => {
    await deleteCachedUrl("abc");
    expect(redisMock.del).toHaveBeenCalledWith(buildUrlCacheKey("abc"));
  });
});
