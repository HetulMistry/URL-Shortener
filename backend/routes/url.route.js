import { Router } from "express";
import {
  createUrl,
  getUserUrls,
  getUrlDetails,
  deleteUrl,
  getUrlAnalytics,
} from "../controllers/url.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { validateUrl } from "../middlewares/url.middleware.js";
import verifyUrlOwnership from "../middlewares/verify-url-ownership.middleware.js";

const urlRouter = Router();

/**
 * @swagger
 * tags:
 *   name: URLs
 *   description: URL Management API
 */

// Protected routes (Require authentication)
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
 *             type: object
 *             required:
 *               - originalUrl
 *             properties:
 *               originalUrl:
 *                 type: string
 *               customAlias:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: URL created successfully
 *       400:
 *         description: Invalid input or alias format
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Alias already taken
 */
urlRouter.post("/", validateUrl, createUrl);

/**
 * @swagger
 * /api/v1/urls:
 *   get:
 *     summary: Get all URLs for the authenticated user
 *     tags: [URLs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of URLs
 *       401:
 *         description: Unauthorized
 */
urlRouter.get("/", getUserUrls);

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
 *     responses:
 *       200:
 *         description: Returns URL details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Not the owner)
 *       404:
 *         description: URL not found
 */
urlRouter.get("/:id", verifyUrlOwnership, getUrlDetails);

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
urlRouter.delete("/:id", verifyUrlOwnership, deleteUrl);

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
 *     responses:
 *       200:
 *         description: Returns URL analytics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 */
urlRouter.get("/:id/analytics", verifyUrlOwnership, getUrlAnalytics);

export default urlRouter;
