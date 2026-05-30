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

  // Verify the token
  try {
    const decoded = jwt.verify(token, secret);

    // Verify the user exists in the database using Prisma. JWT payload must include user identifier like decoded.id.
    try {
      const userId = decoded?.id || decoded?.userId || decoded?.sub;
      if (!userId)
        return res.status(401).json({ message: "Invalid token payload" });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(401).json({ message: "User not found" });

      req.user = user;

      // Proceed to next middleware or route handler after successful authentication and user verification
      next();
    } catch (dbErr) {
      return res.status(500).json({ message: "Database error" });
    }
  } catch (err) {
    const message =
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return res.status(401).json({ message });
  }
};

export default authMiddleware;
