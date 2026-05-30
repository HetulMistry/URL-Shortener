import { config } from "dotenv";

config({
  path: `.env.${process.env.NODE_ENV || "development"}.local`,
});

export const {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  DATABASE_URL,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
} = process.env;

if (
  !PORT ||
  !JWT_SECRET ||
  !DATABASE_URL ||
  !UPSTASH_REDIS_REST_URL ||
  !UPSTASH_REDIS_REST_TOKEN
) {
  console.error("Missing required environment variables.");
  process.exit(1);
}
