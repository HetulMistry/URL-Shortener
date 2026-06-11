import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "utils/**/*.js",
        "services/**/*.js",
        "middlewares/**/*.js",
        "controllers/**/*.js",
        "validation/**/*.js",
        "constants/**/*.js",
        "config/env.js",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
