import { describe, it, expect, vi, beforeEach } from "vitest";
import AppError from "../../utils/AppError.js";

const prismaMock = {
  url: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  analytics: {
    count: vi.fn(),
    groupBy: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((ops) => Promise.all(ops)),
  $queryRaw: vi.fn(),
};

vi.mock("../../config/client.js", () => ({
  default: prismaMock,
}));

vi.mock("../../services/cache.service.js", () => ({
  getCachedUrl: vi.fn().mockResolvedValue(null),
  setCachedUrl: vi.fn(),
  deleteCachedUrl: vi.fn(),
  invalidateUrlCache: vi.fn(),
}));

const urlService = await import("../../services/url.service.js");
const cacheService = await import("../../services/cache.service.js");

describe("url service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a short url", async () => {
    prismaMock.url.findUnique.mockResolvedValue(null);
    prismaMock.url.create.mockResolvedValue({
      id: "url-1",
      shortCode: "abc123",
      originalUrl: "https://example.com",
    });

    const result = await urlService.createShortUrl(
      "https://example.com",
      null,
      null,
      "user-1",
    );

    expect(result.shortCode).toBeTruthy();
  });

  it("returns null when redirect short code is missing", async () => {
    prismaMock.url.findFirst.mockResolvedValue(null);

    const result = await urlService.getOriginalUrlByShortCode("missing", {
      ip: "127.0.0.1",
      userAgent: "test",
      referrer: null,
    });

    expect(result).toBeNull();
  });

  it("uses cache on redirect hit", async () => {
    cacheService.getCachedUrl.mockResolvedValue({
      id: "url-1",
      originalUrl: "https://cached.com",
      expiresAt: null,
    });
    prismaMock.$transaction.mockResolvedValue([]);

    const result = await urlService.getOriginalUrlByShortCode("abc", {
      ip: "127.0.0.1",
      userAgent: "Chrome",
      referrer: "google.com",
    });

    expect(result).toBe("https://cached.com");
  });

  it("throws when deleting missing url", async () => {
    prismaMock.url.findUnique.mockResolvedValue(null);

    await expect(urlService.deleteUrl("missing")).rejects.toThrow(AppError);
  });

  it("builds redirect request info with referrer domain", () => {
    const req = {
      ip: "127.0.0.1",
      headers: {
        "user-agent": "Chrome",
        referer: "https://www.google.com/search",
      },
    };

    const info = urlService.buildRedirectRequestInfo(req);
    expect(info.referrer).toBe("google.com");
  });

  it("updates expiration date", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    prismaMock.url.findUnique.mockResolvedValue({
      id: "url-1",
      shortCode: "abc",
      customAlias: null,
    });
    prismaMock.url.update.mockResolvedValue({
      id: "url-1",
      shortCode: "abc",
      expiresAt: new Date(future),
    });

    const updated = await urlService.updateUrl("url-1", {
      expiresAt: future,
    });

    expect(updated.expiresAt).toBeTruthy();
  });

  it("returns analytics summary", async () => {
    prismaMock.analytics.count.mockResolvedValue(10);
    prismaMock.analytics.groupBy.mockResolvedValue([{ ipAddress: "1.1.1.1" }]);
    prismaMock.analytics.findMany.mockResolvedValue([]);
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ date: "2026-05-31", clicks: 5 }])
      .mockResolvedValueOnce([{ browser: "Chrome", clicks: 5 }])
      .mockResolvedValueOnce([{ referrer: "google.com", clicks: 3 }]);

    const analytics = await urlService.getUrlAnalytics("url-1");

    expect(analytics.totalClicks).toBe(10);
    expect(analytics.browserStats.Chrome).toBe(5);
    expect(analytics.topReferrers[0].referrer).toBe("google.com");
  });
});
