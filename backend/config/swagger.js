import { PORT } from "./env.js";
import swaggerJSDocs from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "URL Shortener API",
      version: "1.0.0",
      description:
        "Production-ready API documentation for URL Shortener backend.",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT token authentication. Include 'Bearer ' prefix followed by the token in the Authorization header.",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string", example: "Validation failed" },
                requestId: { type: "string", example: "a4f7e0c1" },
              },
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            password: { type: "string", minLength: 8, example: "password123" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            password: { type: "string", example: "password123" },
          },
        },
        CreateUrlRequest: {
          type: "object",
          required: ["originalUrl"],
          properties: {
            originalUrl: { type: "string", example: "https://github.com" },
            customAlias: { type: "string", example: "github" },
            expiresAt: {
              type: "string",
              format: "date-time",
              example: "2026-12-31T23:59:59.000Z",
            },
          },
        },
        UpdateUrlRequest: {
          type: "object",
          properties: {
            customAlias: { type: "string", example: "my-link" },
            expiresAt: {
              type: "string",
              format: "date-time",
              example: "2026-12-31T23:59:59.000Z",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js", "./app.js"],
};

const swaggerSpec = swaggerJSDocs(options);
export default swaggerSpec;
