import { PORT } from "./env.js";
import swaggerJSDocs from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "URL Shortener API",
      version: "1.0.0",
      description: "API documentation for URL Shortener backend.",
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
    },
  },
  apis: ["./routes/*.js", "./index.js"],
};

const swaggerSpec = swaggerJSDocs(options);
export default swaggerSpec;
