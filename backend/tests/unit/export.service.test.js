import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  analytics: {
    findMany: vi.fn(),
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
    prismaMock.analytics.findMany
      .mockResolvedValueOnce([
        {
          clickedAt: new Date("2026-05-31T10:00:00.000Z"),
          ipAddress: "127.0.0.1",
          userAgent: "Chrome",
          referrer: "google.com",
        },
      ])
      .mockResolvedValueOnce([]);

    const chunks = [];
    const res = {
      setHeader: vi.fn(),
      write: vi.fn((chunk) => chunks.push(chunk)),
      end: vi.fn(),
    };

    await streamAnalyticsCsv("url-1", res);

    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(chunks.join("")).toContain("google.com");
    expect(res.end).toHaveBeenCalled();
  });
});
