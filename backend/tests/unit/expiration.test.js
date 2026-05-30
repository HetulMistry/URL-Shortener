import { describe, it, expect } from "vitest";
import {
  assertFutureExpiration,
  assertNotExpired,
} from "../../utils/expiration.js";
import AppError from "../../utils/AppError.js";

describe("expiration logic", () => {
  it("allows null expiration", () => {
    expect(() => assertNotExpired(null)).not.toThrow();
    expect(() => assertFutureExpiration(null)).not.toThrow();
  });

  it("throws when url is expired", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(() => assertNotExpired(past)).toThrow(AppError);
  });

  it("throws when expiration is not in the future", () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(() => assertFutureExpiration(past)).toThrow(AppError);
  });

  it("accepts future expiration", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(() => assertFutureExpiration(future)).not.toThrow();
  });
});
