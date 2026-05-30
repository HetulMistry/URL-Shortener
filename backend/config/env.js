import { config } from "dotenv";

config({
  path: `.env.${process.env.NODE_ENV || "development"}.local`,
});

export const { PORT, NODE_ENV, JWT_SECRET, DATABASE_URL } = process.env;

if (!PORT || !JWT_SECRET || !DATABASE_URL) {
  console.error("Missing required environment variables.");
  process.exit(1);
}
