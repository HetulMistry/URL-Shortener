process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://test:test@localhost:5432/test?schema=public";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-jwt-secret-key-minimum-length";
process.env.UPSTASH_REDIS_REST_URL =
  process.env.UPSTASH_REDIS_REST_URL || "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || "test-token";
process.env.ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS || "http://localhost:5173";
process.env.APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:3001";
