import { Router } from "express";
import {
  createUrl,
  getUserUrls,
  getUrlDetails,
  deleteUrl,
  getUrlAnalytics,
  updateUrl,
  exportUrlAnalytics,
  getUrlQrCode,
} from "../controllers/url.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import verifyUrlOwnership from "../middlewares/verify-url-ownership.middleware.js";
import { urlCreationLimiter } from "../middlewares/rate-limit.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  analyticsQuerySchema,
  createUrlSchema,
  paginationSchema,
  qrQuerySchema,
  updateUrlSchema,
  urlIdParamSchema,
} from "../validation/url.schema.js";

const urlRouter = Router();
const validateUrlId = validate(urlIdParamSchema, "params");

/**
 * @swagger
 * tags:
 *   name: URLs
 *   description: URL Management API
 */

urlRouter.use(authMiddleware);

/**
 * @swagger
 * /api/v1/urls:
 *   post:
 *     summary: Create a short URL
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUrlRequest'
 *     responses:
 *       201:
 *         description: URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Alias already taken
 */
urlRouter.post("/", urlCreationLimiter, validate(createUrlSchema), createUrl);

/**
 * @swagger
 * /api/v1/urls:
 *   get:
 *     summary: Get all URLs for the authenticated user
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a paginated list of URLs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 */
urlRouter.get("/", validate(paginationSchema, "query"), getUserUrls);

/**
 * @swagger
 * /api/v1/urls/{id}:
 *   get:
 *     summary: Get details of a specific URL
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Returns URL details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 */
urlRouter.get("/:id", validateUrlId, verifyUrlOwnership, getUrlDetails);

/**
 * @swagger
 * /api/v1/urls/{id}:
 *   delete:
 *     summary: Delete a specific URL
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: URL deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 */
urlRouter.delete("/:id", validateUrlId, verifyUrlOwnership, deleteUrl);

/**
 * @swagger
 * /api/v1/urls/{id}:
 *   patch:
 *     summary: Update a specific URL
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUrlRequest'
 *     responses:
 *       200:
 *         description: URL updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 *       409:
 *         description: Alias already taken
 */
urlRouter.patch(
  "/:id",
  validateUrlId,
  verifyUrlOwnership,
  validate(updateUrlSchema),
  updateUrl,
);

/**
 * @swagger
 * /api/v1/urls/{id}/analytics:
 *   get:
 *     summary: Get analytics for a specific URL
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Returns URL analytics
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UrlAnalyticsResponse'
 *             example:
 *               success: true
 *               data:
 *                 totalClicks: 100
 *                 uniqueVisitors: 45
 *                 clicksPerDay:
 *                   - date: "2026-05-31"
 *                     clicks: 17
 *                 browserStats:
 *                   Chrome: 80
 *                   Firefox: 15
 *                   Safari: 5
 *                 topReferrers:
 *                   - source: google.com
 *                     count: 40
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 */
urlRouter.get(
  "/:id/analytics",
  validateUrlId,
  verifyUrlOwnership,
  validate(analyticsQuerySchema, "query"),
  getUrlAnalytics,
);

/**
 * @swagger
 * /api/v1/urls/{id}/export:
 *   get:
 *     summary: Export analytics as CSV
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 */
urlRouter.get(
  "/:id/export",
  validateUrlId,
  verifyUrlOwnership,
  exportUrlAnalytics,
);

/**
 * @swagger
 * /api/v1/urls/{id}/qr:
 *   get:
 *     summary: Generate QR code for a short URL
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, base64]
 *           default: png
 *     responses:
 *       200:
 *         description: QR code image or base64 payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 */
urlRouter.get(
  "/:id/qr",
  validateUrlId,
  verifyUrlOwnership,
  validate(qrQuerySchema, "query"),
  getUrlQrCode,
);

export default urlRouter;
