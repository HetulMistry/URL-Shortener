import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.js";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../../config/client.js", () => ({
  default: prismaMock,
}));

const { default: authMiddleware } =
  await import("../../middlewares/auth.middleware.js");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

describe("auth middleware", () => {
  it("rejects missing authorization header", async () => {
    const req = { headers: {}, id: "req-1" };
    const res = createResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects expired token", async () => {
    const expiredToken = jwt.sign({ id: "1" }, JWT_SECRET, {
      expiresIn: "-1s",
    });
    const req = {
      headers: { authorization: `Bearer ${expiredToken}` },
      id: "req-2",
    };
    const res = createResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe("Token expired");
  });

  it("attaches user for valid token", async () => {
    const token = jwt.sign({ id: "user-1", email: "a@b.com" }, JWT_SECRET);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "a@b.com",
      name: "Jane",
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
      id: "req-3",
    };
    const res = createResponse();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe("user-1");
  });
});
