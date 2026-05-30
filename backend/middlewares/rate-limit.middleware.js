import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response.js";

const rateLimitHandler = (message) => (req, res) => {
  sendError(res, 429, message, req.id);
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many authentication attempts"),
});

export const urlCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Rate limit exceeded"),
});
