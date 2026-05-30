import { describe, it, expect } from "vitest";
import { sendError, sendSuccess, sanitizeUser } from "../../utils/response.js";

describe("response helpers", () => {
  it("sanitizes user objects", () => {
    const user = {
      id: "1",
      name: "Jane",
      email: "jane@example.com",
      password: "secret",
      createdAt: new Date("2026-01-01"),
    };

    expect(sanitizeUser(user)).toEqual({
      id: "1",
      name: "Jane",
      email: "jane@example.com",
      createdAt: user.createdAt,
    });
  });

  it("formats success and error responses", () => {
    const successRes = {
      statusCode: 0,
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

    sendSuccess(successRes, 200, { ok: true });
    expect(successRes.body).toEqual({ success: true, data: { ok: true } });

    const errorRes = {
      statusCode: 0,
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

    sendError(errorRes, 400, "Bad request", "req-1");
    expect(errorRes.body).toEqual({
      success: false,
      error: { message: "Bad request", requestId: "req-1" },
    });
  });
});
