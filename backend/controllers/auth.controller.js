import bcrypt from "bcrypt";
import prisma from "../config/client.js";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req, res) => {
  // Salt rounds for bcrypt hashing. Higher is more secure but slower.
  const SALT_ROUNDS = 10;

  // Validate input fields
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });

  if (password.length < 8)
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters long" });

  try {
    // Fetech user by email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(409).json({ message: "Email already registered" });

    // Hash password and create user in db
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = generateToken(user);

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to register user" });
  }
};

export const login = async (req, res) => {
  // Validate input fields
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Fetch user by email from db
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    // Compare input password with hashed password in db
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to login" });
  }
};

export const logout = (req, res) => {
  // Since auth is stateless with JWT, logout is handled on client by deleting the token. This endpoint can be used to confirm the token was valid before logout.
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  return res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const { id, name, email, createdAt } = req.user;
  return res.status(200).json({ user: { id, name, email, createdAt } });
};
