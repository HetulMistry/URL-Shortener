import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  url: {
    findUnique: vi.fn(),
  },
};

vi.mock("../../config/client.js", () => ({
  default: prismaMock,
}));

const { streamAnalyticsCsv } = await import("../../services/export.service.js");

describe("export service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("streams analytics rows as csv", async () => {
    prismaMock.url.findUnique.mockResolvedValue({
      id: "url-1",
      shortCode: "abc123",
      originalUrl: "https://example.com",
      clicks: 2,
      createdAt: new Date("2026-05-31T10:00:00.000Z"),
      expiresAt: null,
      analytics: [
        {
          clickedAt: new Date("2026-05-31T10:00:00.000Z"),
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0 Chrome/120.0",
          referrer: "google.com",
        },
      ],
    });

    const headers = {};
    let body = "";
    const res = {
      setHeader: vi.fn((key, value) => {
        headers[key] = value;
      }),
      send: vi.fn((payload) => {
        body = payload;
      }),
    };

    await streamAnalyticsCsv("url-1", res);

    expect(headers["Content-Type"]).toBe("text/csv; charset=utf-8");
    expect(body).toContain("google.com");
    expect(body).toContain("abc123");
    expect(res.send).toHaveBeenCalled();
  });
});
