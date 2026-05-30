import { describe, it, expect } from "vitest";
import {
  isValidAliasFormat,
  isValidAliasLength,
  isReservedAlias,
  normalizeAlias,
  validateCustomAlias,
} from "../../utils/alias.validation.js";
import AppError from "../../utils/AppError.js";

describe("alias validation", () => {
  it("normalizes aliases to lowercase", () => {
    expect(normalizeAlias("GitHub")).toBe("github");
  });

  it("validates alias format", () => {
    expect(isValidAliasFormat("abc-123")).toBe(true);
    expect(isValidAliasFormat("bad alias")).toBe(false);
  });

  it("validates alias length", () => {
    expect(isValidAliasLength("abc")).toBe(true);
    expect(isValidAliasLength("ab")).toBe(false);
  });

  it("detects reserved aliases", () => {
    expect(isReservedAlias("api")).toBe(true);
    expect(isReservedAlias("custom")).toBe(false);
  });

  it("returns normalized alias when valid", () => {
    expect(validateCustomAlias("My-Link")).toBe("my-link");
  });

  it("throws AppError for invalid alias", () => {
    expect(() => validateCustomAlias("api")).toThrow(AppError);
    expect(() => validateCustomAlias("!!")).toThrow(AppError);
  });
});
