import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  $queryRaw: vi.fn(),
};

vi.mock("../../config/client.js", () => ({
  default: prismaMock,
}));

vi.mock("../../config/redis.js", () => ({
  checkRedisConnection: vi.fn(),
}));

const healthService = await import("../../services/health.service.js");
const { checkRedisConnection } = await import("../../config/redis.js");

describe("health service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns healthy when all dependencies are connected", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    checkRedisConnection.mockResolvedValue(true);

    const health = await healthService.getHealthStatus();

    expect(health.status).toBe("healthy");
    expect(health.database).toBe("connected");
    expect(health.redis).toBe("connected");
  });

  it("returns degraded when redis is down", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    checkRedisConnection.mockResolvedValue(false);

    const health = await healthService.getHealthStatus();

    expect(health.status).toBe("degraded");
  });

  it("returns unhealthy when database is down", async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));
    checkRedisConnection.mockResolvedValue(false);

    const health = await healthService.getHealthStatus();

    expect(health.status).toBe("unhealthy");
  });
});
