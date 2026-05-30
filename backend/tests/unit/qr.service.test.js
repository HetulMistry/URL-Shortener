import { describe, it, expect } from "vitest";
import { buildShortUrl, generateQrCode } from "../../services/qr.service.js";
import AppError from "../../utils/AppError.js";

describe("qr service helpers", () => {
  it("builds short url from base and code", () => {
    expect(buildShortUrl("http://localhost:3000", "abc123")).toBe(
      "http://localhost:3000/abc123",
    );
    expect(buildShortUrl("http://localhost:3000/", "abc123")).toBe(
      "http://localhost:3000/abc123",
    );
  });

  it("generates png qr buffer", async () => {
    const buffer = await generateQrCode("http://localhost:3000/abc", "png");
    expect(Buffer.isBuffer(buffer)).toBe(true);
  });

  it("generates base64 qr code", async () => {
    const dataUrl = await generateQrCode("http://localhost:3000/abc", "base64");
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("throws when base url is missing", () => {
    expect(() => buildShortUrl("", "abc123")).toThrow(AppError);
  });
});
