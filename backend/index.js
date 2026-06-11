import createApp from "./app.js";
import { PORT, APP_BASE_URL, NODE_ENV } from "./config/env.js";
import prisma from "./config/client.js";
import { flushLogs, logger } from "./utils/logger.js";

const app = createApp();
let isShuttingDown = false;

const server = app.listen(PORT, () => {
  logger.info("Server started", {
    port: PORT,
    env: NODE_ENV,
    baseUrl: APP_BASE_URL,
  });
});

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`Received ${signal}. Starting graceful shutdown.`);

  server.close(async () => {
    logger.info("HTTP server closed.");

    try {
      await prisma.$disconnect();
      logger.info("Prisma disconnected.");
    } catch (error) {
      logger.error("Failed to disconnect Prisma", { message: error.message });
    }

    try {
      await flushLogs();
    } catch (error) {
      console.error("Failed to flush logs", error);
    }

    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export { app, server };
