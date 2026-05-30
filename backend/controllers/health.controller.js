import * as healthService from "../services/health.service.js";
import { sendSuccess } from "../utils/response.js";

export const getHealth = async (req, res, next) => {
  try {
    const health = await healthService.getHealthStatus();
    const statusCode = health.status === "unhealthy" ? 503 : 200;

    return sendSuccess(res, statusCode, health);
  } catch (error) {
    next(error);
  }
};
