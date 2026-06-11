import { existsSync } from "fs";
import { config } from "dotenv";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV || "development";
const isDev = nodeEnv === "development";
const isTest = nodeEnv === "test";

const envFiles = [
  ".env",
  `.env.${nodeEnv}`,
  ".env.local",
  `.env.${nodeEnv}.local`,
];

for (const file of envFiles)
  if (existsSync(file)) config({ path: file, override: true });

if (!process.env.ALLOWED_ORIGINS && (isDev || isTest))
  process.env.ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:3000";

if (!process.env.APP_BASE_URL && (isDev || isTest))
  process.env.APP_BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
    UPSTASH_REDIS_REST_URL: z
      .string()
      .url("UPSTASH_REDIS_REST_URL must be a valid URL"),
    UPSTASH_REDIS_REST_TOKEN: z
      .string()
      .min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
    ALLOWED_ORIGINS: z
      .string()
      .min(1, "ALLOWED_ORIGINS is required")
      .transform((value) =>
        value
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),
    APP_BASE_URL: z.string().url().optional(),
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.APP_BASE_URL)
        ctx.addIssue({
          code: "custom",
          path: ["APP_BASE_URL"],
          message: "APP_BASE_URL is required in production",
        });

      if (data.JWT_SECRET.length < 32)
        ctx.addIssue({
          code: "custom",
          path: ["JWT_SECRET"],
          message: "JWT_SECRET must be at least 32 characters in production",
        });

      if (data.ALLOWED_ORIGINS.length === 0)
        ctx.addIssue({
          code: "custom",
          path: ["ALLOWED_ORIGINS"],
          message: "ALLOWED_ORIGINS must include at least one origin",
        });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  console.error("Environment validation failed:\n", formatted);
  process.exit(1);
}

export const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  ALLOWED_ORIGINS,
  APP_BASE_URL,
  LOG_LEVEL,
} = parsed.data;
