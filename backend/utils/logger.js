import fs from "fs";
import path from "path";
import winston from "winston";
import { NODE_ENV } from "../config/env.js";

const logsDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const buildMeta = (meta = {}) => {
  const { requestId, method, route, status, responseTime, ip, ...rest } = meta;
  return {
    ...(requestId && { requestId }),
    ...(method && { method }),
    ...(route && { route }),
    ...(status !== undefined && { status }),
    ...(responseTime !== undefined && { responseTime }),
    ...(ip && { ip }),
    ...rest,
  };
};

const consoleFormat =
  NODE_ENV === "production"
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      )
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? ` ${JSON.stringify(buildMeta(meta))}`
            : "";
          return `${timestamp} [${level}]: ${message}${metaString}`;
        }),
      );

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logsDir, "access.log"),
      level: "info",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
    }),
  ],
});

const logWithMeta =
  (level) =>
  (message, meta = {}) => {
    logger.log(level, message, buildMeta(meta));
  };

export const flushLogs = () =>
  new Promise((resolve) => {
    logger.on("finish", resolve);
    logger.end();
  });

export { logger, buildMeta, logWithMeta };
