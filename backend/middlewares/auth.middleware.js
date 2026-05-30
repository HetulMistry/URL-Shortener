import jwt from "jsonwebtoken";
import prisma from "../config/client.js";
import { JWT_SECRET } from "../config/env.js";
import { sendError } from "../utils/response.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return sendError(
      res,
      401,
      "Authorization token missing or invalid",
      req.id,
    );

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded?.id || decoded?.userId || decoded?.sub;

    if (!userId) return sendError(res, 401, "Invalid token payload", req.id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendError(res, 401, "User not found", req.id);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return sendError(res, 401, "Token expired", req.id);

    if (err.name === "JsonWebTokenError")
      return sendError(res, 401, "Invalid token", req.id);

    next(err);
  }
};

export default authMiddleware;
