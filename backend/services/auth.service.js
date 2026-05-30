import bcrypt from "bcrypt";
import prisma from "../config/client.js";
import AppError from "../utils/AppError.js";
import { generateToken } from "../utils/generateToken.js";
import { sanitizeUser } from "../utils/response.js";

const SALT_ROUNDS = 10;

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError("Email already registered", 409);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401);

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new AppError("Invalid email or password", 401);

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
};
