import { describe, it, expect } from "vitest";
import { validateOriginalUrl } from "../../utils/url.validation.js";
import AppError from "../../utils/AppError.js";

describe("url validation", () => {
  it("accepts valid http and https urls", () => {
    expect(validateOriginalUrl("https://example.com")).toBe(
      "https://example.com",
    );
    expect(validateOriginalUrl("http://example.com/path")).toBe(
      "http://example.com/path",
    );
  });

  it("rejects missing url", () => {
    expect(() => validateOriginalUrl("")).toThrow(AppError);
  });

  it("rejects invalid url format", () => {
    expect(() => validateOriginalUrl("not-a-url")).toThrow(AppError);
  });

  it("rejects non-http protocols", () => {
    expect(() => validateOriginalUrl("ftp://example.com")).toThrow(AppError);
  });
});
