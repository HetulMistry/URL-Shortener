import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { JWT_EXPIRATION } from "../constants/auth.constants.js";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION,
    },
  );
};
