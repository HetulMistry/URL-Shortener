import rateLimit from "express-rate-limit";

const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    message,
  });
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
