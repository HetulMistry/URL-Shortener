import * as authService from "../services/auth.service.js";
import { sendSuccess, sanitizeUser } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, 201, result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const logout = (_, res) =>
  sendSuccess(res, 200, { message: "Logged out successfully" });

export const getMe = (req, res) =>
  sendSuccess(res, 200, { user: sanitizeUser(req.user) });
