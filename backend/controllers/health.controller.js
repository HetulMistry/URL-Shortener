import * as healthService from "../services/health.service.js";

export const getHealth = async (req, res, next) => {
  try {
    const health = await healthService.getHealthStatus();
    const statusCode = health.status === "healthy" ? 200 : 503;

    return res.status(statusCode).json(health);
  } catch (error) {
    next(error);
  }
};
