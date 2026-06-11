import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { generateToken } from "../../utils/generateToken.js";

const testUser = {
  id: "user-1",
  name: "Jane",
  email: "jane@example.com",
  password: "hashed-password",
  createdAt: new Date(),
};

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  url: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  analytics: {
    create: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn((operations) => Promise.all(operations)),
  $queryRaw: vi.fn(),
  $disconnect: vi.fn(),
};

vi.mock("../../config/client.js", () => ({
  default: prismaMock,
}));

vi.mock("../../config/redis.js", () => ({
  getRedis: vi.fn(),
  checkRedisConnection: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../services/cache.service.js", () => ({
  getCachedUrl: vi.fn().mockResolvedValue(null),
  setCachedUrl: vi.fn(),
  deleteCachedUrl: vi.fn(),
  invalidateUrlCache: vi.fn(),
}));

const bcryptMock = {
  hash: vi.fn().mockResolvedValue("hashed-password"),
  compare: vi.fn(),
};

vi.mock("bcrypt", () => ({
  default: bcryptMock,
}));

const { default: createApp } = await import("../../app.js");
const { checkRedisConnection } = await import("../../config/redis.js");

const testUrlId = "11111111-1111-4111-8111-111111111111";

describe("integration routes", () => {
  let app;
  let authToken;

  beforeEach(() => {
    app = createApp();
    authToken = generateToken(testUser);
    vi.resetAllMocks();
  });

  it("GET /health returns monitoring-friendly health response", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    checkRedisConnection.mockResolvedValue(true);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "healthy",
      database: "connected",
      redis: "connected",
    });
    expect(response.body.uptime).toEqual(expect.any(Number));
    expect(response.headers["x-request-id"]).toBeDefined();
  });

  it("GET /health returns 503 when a dependency is degraded", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    checkRedisConnection.mockResolvedValue(false);

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("degraded");
  });

  it("sets security headers on responses", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    checkRedisConnection.mockResolvedValue(true);

    const response = await request(app).get("/health");

    expect(response.headers["content-security-policy"]).toBeDefined();
    expect(response.headers["x-frame-options"]).toBeDefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBeDefined();
  });

  it("POST /api/v1/auth/register validates payload", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "",
      email: "invalid",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.message).toBeTruthy();
  });

  it("POST /api/v1/auth/register creates user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      name: "Jane",
      email: "jane@example.com",
      createdAt: new Date(),
    });

    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeTruthy();
  });

  it("POST /api/v1/auth/login returns token for valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "jane@example.com",
      password: "hashed-password",
      name: "Jane",
      createdAt: new Date(),
    });
    bcryptMock.compare.mockResolvedValue(true);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeTruthy();
  });

  it("GET /api/v1/auth/me requires authentication", async () => {
    const response = await request(app).get("/api/v1/auth/me");
    expect(response.status).toBe(401);
    expect(response.body.error.message).toContain("Authorization");
  });

  it("GET /:shortCode returns 404 for missing url", async () => {
    prismaMock.url.findFirst.mockResolvedValue(null);

    const response = await request(app).get("/missing-code");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("GET /api/v1/auth/me returns current user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe("jane@example.com");
  });

  it("POST /api/v1/urls creates a short url", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);
    prismaMock.url.findUnique.mockResolvedValue(null);
    prismaMock.url.create.mockResolvedValue({
      id: testUrlId,
      shortCode: "abc123",
      originalUrl: "https://example.com",
      userId: testUser.id,
    });

    const response = await request(app)
      .post("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ originalUrl: "https://example.com" });

    expect(response.status).toBe(201);
    expect(response.body.data.url.shortCode).toBeTruthy();
  });

  it("GET /api/v1/urls returns paginated urls", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);
    prismaMock.url.count.mockResolvedValue(1);
    prismaMock.url.findMany.mockResolvedValue([
      { id: "url-1", shortCode: "abc123", originalUrl: "https://example.com" },
    ]);

    const response = await request(app)
      .get("/api/v1/urls")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.urls).toHaveLength(1);
  });

  it("GET /api/v1/urls/:id returns url details", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);
    prismaMock.url.findUnique.mockResolvedValue({
      id: testUrlId,
      shortCode: "abc123",
      originalUrl: "https://example.com",
      userId: testUser.id,
    });

    const response = await request(app)
      .get(`/api/v1/urls/${testUrlId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.url.shortCode).toBe("abc123");
  });

  it("PATCH /api/v1/urls/:id updates a url", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);
    prismaMock.url.findUnique
      .mockResolvedValueOnce({
        id: testUrlId,
        shortCode: "abc123",
        customAlias: null,
        userId: testUser.id,
      })
      .mockResolvedValueOnce({
        id: testUrlId,
        shortCode: "abc123",
        customAlias: null,
        userId: testUser.id,
      })
      .mockResolvedValueOnce(null);
    prismaMock.url.update.mockResolvedValue({
      id: testUrlId,
      shortCode: "new-alias",
      customAlias: "new-alias",
    });

    const response = await request(app)
      .patch(`/api/v1/urls/${testUrlId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ customAlias: "new-alias" });

    expect(response.status).toBe(200);
    expect(response.body.data.url.shortCode).toBe("new-alias");
  });

  it("DELETE /api/v1/urls/:id deletes a url", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);
    prismaMock.url.findUnique.mockImplementation(async ({ where }) => {
      if (where.id === testUrlId) {
        return {
          id: testUrlId,
          shortCode: "abc123",
          userId: testUser.id,
        };
      }
      return null;
    });
    prismaMock.analytics.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.url.delete.mockResolvedValue({ id: testUrlId });
    prismaMock.$transaction.mockImplementation((ops) => Promise.all(ops));

    const response = await request(app)
      .delete(`/api/v1/urls/${testUrlId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.message).toContain("deleted");
  });

  it("POST /api/v1/auth/logout succeeds for authenticated user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.message).toContain("Logged out");
  });

  it("GET /api/v1/urls/:id rejects malformed URL ids", async () => {
    prismaMock.user.findUnique.mockResolvedValue(testUser);

    const response = await request(app)
      .get("/api/v1/urls/not-a-uuid")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(prismaMock.url.findUnique).not.toHaveBeenCalled();
  });

  it("GET /:shortCode redirects when url exists", async () => {
    prismaMock.url.findFirst.mockResolvedValue({
      id: "url-1",
      originalUrl: "https://example.com",
      shortCode: "abc123",
      expiresAt: null,
    });
    prismaMock.$transaction.mockResolvedValue([]);

    const response = await request(app).get("/abc123");
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("https://example.com");
  });
});
