import { describe, it, expect, vi } from "vitest";
import { Prisma } from "@prisma/client";
import errorMiddleware from "../../middlewares/error.middleware.js";

vi.mock("../../utils/logger.js", () => ({
  logger: { error: vi.fn() },
}));

const createResponse = () => {
  const res = {
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
  };
  return res;
};

describe("error middleware", () => {
  it("formats app errors with request id", () => {
    const err = new Error("Bad request");
    err.statusCode = 400;
    const req = {
      id: "req-99",
      method: "GET",
      originalUrl: "/test",
      ip: "1.1.1.1",
    };
    const res = createResponse();
    const next = vi.fn();

    errorMiddleware(err, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: { message: "Bad request", requestId: "req-99" },
    });
  });

  it("maps prisma duplicate errors", () => {
    const err = new Prisma.PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "7.8.0",
      meta: { target: ["email"] },
    });
    const req = { id: "req-1" };
    const res = createResponse();

    errorMiddleware(err, req, res, vi.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain("Duplicate value");
  });

  it("maps jwt errors", () => {
    const err = new Error("invalid");
    err.name = "JsonWebTokenError";
    const req = { id: "req-1" };
    const res = createResponse();

    errorMiddleware(err, req, res, vi.fn());

    expect(res.statusCode).toBe(401);
    expect(res.body.error.message).toBe("Invalid token");
  });

  it("maps token expired and cors errors", () => {
    const expired = new Error("expired");
    expired.name = "TokenExpiredError";
    const req = { id: "req-2" };
    const res = createResponse();

    errorMiddleware(expired, req, res, vi.fn());
    expect(res.body.error.message).toBe("Token expired");

    const corsError = new Error("Origin is not allowed by CORS policy");
    errorMiddleware(corsError, req, res, vi.fn());
    expect(res.statusCode).toBe(403);
  });

  it("maps prisma not found and validation errors", () => {
    const notFound = new Prisma.PrismaClientKnownRequestError("missing", {
      code: "P2025",
      clientVersion: "7.8.0",
    });
    const req = { id: "req-3" };
    const res = createResponse();

    errorMiddleware(notFound, req, res, vi.fn());
    expect(res.body.error.message).toBe("Resource not found");

    const validation = new Prisma.PrismaClientValidationError("bad", {
      clientVersion: "7.8.0",
    });
    errorMiddleware(validation, req, res, vi.fn());
    expect(res.statusCode).toBe(400);
  });
});
