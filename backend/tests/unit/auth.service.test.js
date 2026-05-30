import { describe, it, expect, vi, beforeEach } from "vitest";
import AppError from "../../utils/AppError.js";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock("../../config/client.js", () => ({
  default: prismaMock,
}));

vi.mock("../../utils/generateToken.js", () => ({
  generateToken: vi.fn(() => "mock-token"),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed"),
    compare: vi.fn(),
  },
}));

const authService = await import("../../services/auth.service.js");
const bcrypt = (await import("bcrypt")).default;

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a new user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "1",
      name: "Jane",
      email: "jane@example.com",
      createdAt: new Date(),
    });

    const result = await authService.registerUser({
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
    });

    expect(result.token).toBe("mock-token");
    expect(result.user.email).toBe("jane@example.com");
  });

  it("throws when email already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "1" });

    await expect(
      authService.registerUser({
        name: "Jane",
        email: "jane@example.com",
        password: "password123",
      }),
    ).rejects.toThrow(AppError);
  });

  it("logs in with valid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "1",
      email: "jane@example.com",
      password: "hashed",
      name: "Jane",
      createdAt: new Date(),
    });
    bcrypt.compare.mockResolvedValue(true);

    const result = await authService.loginUser({
      email: "jane@example.com",
      password: "password123",
    });

    expect(result.token).toBe("mock-token");
  });

  it("throws for invalid credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.loginUser({
        email: "jane@example.com",
        password: "password123",
      }),
    ).rejects.toThrow(AppError);
  });
});
