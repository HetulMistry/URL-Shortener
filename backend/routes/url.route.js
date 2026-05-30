import { Router } from "express";
import {
  createUrl,
  getUserUrls,
  getUrlDetails,
  deleteUrl,
  getUrlAnalytics,
  updateUrl,
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for URLs
 *     responses:
 *       200:
 *         description: Returns a paginated list of URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customAlias:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: URL updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 *       409:
 *         description: Alias already taken
 */
urlRouter.patch("/:id", verifyUrlOwnership, updateUrl);

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalClicks:
 *                       type: integer
 *                     uniqueVisitors:
 *                       type: integer
 *                     clicksPerDay:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           clicks:
 *                             type: integer
 *                     recentVisits:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: URL not found
 */
urlRouter.get("/:id/analytics", verifyUrlOwnership, getUrlAnalytics);

export default urlRouter;
