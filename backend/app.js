import express from "express";
import helmet from "helmet";
import authRouter from "./routes/auth.route.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import urlRouter from "./routes/url.route.js";
import { redirectToOriginalUrl } from "./controllers/url.controller.js";
import { getHealth } from "./controllers/health.controller.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import requestLogger from "./middlewares/request-log.middleware.js";
import requestIdMiddleware from "./middlewares/request-id.middleware.js";
import corsMiddleware from "./middlewares/cors.middleware.js";

const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static("public"));

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Application health check
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Service is healthy or degraded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *             example:
   *               success: true
   *               data:
   *                 status: healthy
   *                 database: connected
   *                 redis: connected
   *                 uptime: 1234
   *       503:
   *         description: Service is unhealthy
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   */
  app.get("/health", getHealth);

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/urls", urlRouter);
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  /**
   * @swagger
   * /{shortCode}:
   *   get:
   *     summary: Redirect to original URL
   *     tags: [Redirect]
   *     parameters:
   *       - in: path
   *         name: shortCode
   *         required: true
   *         schema:
   *           type: string
   *         description: The short code or custom alias
   *     responses:
   *       302:
   *         description: Redirects to the original URL
   *       404:
   *         description: URL not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       410:
   *         description: URL expired
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.get("/:shortCode", redirectToOriginalUrl);

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Root endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Service is running
   */
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use(errorMiddleware);

  return app;
};

export default createApp;
