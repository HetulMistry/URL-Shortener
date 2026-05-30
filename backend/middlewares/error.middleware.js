import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { sendError } from "../utils/response.js";

const errorMiddleware = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode;

    logger.error(err.stack || err.message || err, {
      requestId: req?.id,
      route: req?.originalUrl,
      method: req?.method,
      ip: req?.ip,
    });

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const target = err.meta?.target ? err.meta.target.join(", ") : "field";
        error = new Error(`Duplicate value entered for ${target}`);
        error.statusCode = 400;
      }

      if (err.code === "P2025") {
        error = new Error("Resource not found");
        error.statusCode = 404;
      }

      if (err.code === "P2003") {
        error = new Error("Invalid reference: Foreign key constraint failed");
        error.statusCode = 400;
      }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
      error = new Error("Validation error: Invalid input data");
      error.statusCode = 400;
    }

    if (err instanceof Prisma.PrismaClientInitializationError) {
      error = new Error("Database connection failed");
      error.statusCode = 500;
    }

    if (err.name === "JsonWebTokenError") {
      error = new Error("Invalid token");
      error.statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
      error = new Error("Token expired");
      error.statusCode = 401;
    }

    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      error = new Error("Invalid JSON payload passed");
      error.statusCode = 400;
    }

    if (err.message?.includes("not allowed by CORS")) {
      error.statusCode = 403;
    }

    sendError(
      res,
      error.statusCode || 500,
      error.message || "Server Error",
      req?.id,
    );
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
