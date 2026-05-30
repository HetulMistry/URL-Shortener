import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/generateToken.js";
import { JWT_SECRET } from "../../config/env.js";

describe("generateToken", () => {
  it("creates a valid jwt with user id and email", () => {
    const user = {
      id: "user-123",
      email: "test@example.com",
    };

    const token = generateToken(user);
    const decoded = jwt.verify(token, JWT_SECRET);

    expect(decoded.id).toBe(user.id);
    expect(decoded.email).toBe(user.email);
  });
});
