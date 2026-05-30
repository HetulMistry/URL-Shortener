import { Prisma } from "@prisma/client";

const errorMiddleware = (err, _, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode;

    console.error(err);

    // --- Prisma Errors ---
    // Handle Prisma Known Request Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint failed
      if (err.code === "P2002") {
        const target = err.meta?.target ? err.meta.target.join(", ") : "field";
        const message = `Duplicate value entered for ${target}`;
        error = new Error(message);
        error.statusCode = 400;
      }

      // P2025: Record not found
      if (err.code === "P2025") {
        const message = "Resource not found";
        error = new Error(message);
        error.statusCode = 404;
      }

      // P2003: Foreign key constraint failed
      if (err.code === "P2003") {
        const message = "Invalid reference: Foreign key constraint failed";
        error = new Error(message);
        error.statusCode = 400;
      }
    }

    // Handle Prisma Validation Errors
    if (err instanceof Prisma.PrismaClientValidationError) {
      const message = "Validation error: Invalid input data";
      error = new Error(message);
      error.statusCode = 400;
    }

    // Handle Prisma Initialization Errors (e.g., bad connection string)
    if (err instanceof Prisma.PrismaClientInitializationError) {
      const message = "Database connection failed";
      error = new Error(message);
      error.statusCode = 500;
    }

    // --- JWT Authentication Errors ---
    if (err.name === "JsonWebTokenError") {
      const message = "Invalid token";
      error = new Error(message);
      error.statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {
      const message = "Token expired";
      error = new Error(message);
      error.statusCode = 401;
    }

    // --- Express/Node Errors ---
    // Handle malformed JSON body errors (from express.json())
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      const message = "Invalid JSON payload passed";
      error = new Error(message);
      error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || "Server Error",
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
