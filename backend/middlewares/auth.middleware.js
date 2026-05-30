import jwt from "jsonwebtoken";
import prisma from "../config/client.js";

const authMiddleware = async (req, res, next) => {
  // Access Bearer token from Authorization header
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res
      .status(401)
      .json({ message: "Authorization token missing or invalid" });

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;
  if (!secret)
    return res.status(500).json({ message: "JWT secret not configured" });

  // Verify the token and user
  try {
    const decoded = jwt.verify(token, secret);
    const userId = decoded?.id || decoded?.userId || decoded?.sub;

    if (!userId)
      return res.status(401).json({ message: "Invalid token payload" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    // Pass any other errors (like database connection issues) to the error handler
    next(err);
  }
};

export default authMiddleware;
