import { existsSync } from "fs";
import { config } from "dotenv";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV || "development";

const envFiles = [
  ".env",
  `.env.${nodeEnv}`,
  ".env.local",
  `.env.${nodeEnv}.local`,
];

for (const file of envFiles)
  if (existsSync(file)) config({ path: file, override: true });

if (
  !process.env.ALLOWED_ORIGINS &&
  (nodeEnv === "development" || nodeEnv === "test")
)
  process.env.ALLOWED_ORIGINS = "http://localhost:5173,http://localhost:3000";

if (
  !process.env.APP_BASE_URL &&
  (nodeEnv === "development" || nodeEnv === "test")
)
  process.env.APP_BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive(),
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
} = parsed.data;
