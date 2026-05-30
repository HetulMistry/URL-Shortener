import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerSchema, loginSchema } from "../../validation/auth.schema.js";
import {
  analyticsQuerySchema,
  createUrlSchema,
  paginationSchema,
  updateUrlSchema,
} from "../../validation/url.schema.js";

describe("validation schemas", () => {
  it("validates register payload", () => {
    const result = registerSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid login payload", () => {
    const result = loginSchema.safeParse({ email: "bad", password: "" });
    expect(result.success).toBe(false);
  });

  it("validates create url payload", () => {
    const result = createUrlSchema.safeParse({
      originalUrl: "https://example.com",
      customAlias: "demo",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-http create url payload", () => {
    const result = createUrlSchema.safeParse({
      originalUrl: "ftp://example.com",
    });
    expect(result.success).toBe(false);
  });

  it("validates update url payload", () => {
    const result = updateUrlSchema.safeParse({ customAlias: "new-alias" });
    expect(result.success).toBe(true);
  });

  it("validates pagination defaults", () => {
    const result = paginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it("validates analytics query params", () => {
    const result = analyticsQuerySchema.parse({
      startDate: "2026-05-01",
      endDate: "2026-05-31",
    });
    expect(result.startDate).toBe("2026-05-01");
  });
});

describe("validate middleware", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("passes validated body to next handler", async () => {
    const { default: validate } =
      await import("../../middlewares/validate.middleware.js");

    const req = {
      body: { email: "jane@example.com", password: "password123" },
      id: "req-1",
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    validate(loginSchema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.email).toBe("jane@example.com");
  });

  it("returns standardized validation error", async () => {
    const { default: validate } =
      await import("../../middlewares/validate.middleware.js");

    const req = { body: { email: "bad" }, id: "req-2" };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    validate(loginSchema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ message: expect.any(String) }),
      }),
    );
  });
});
