import morgan from "morgan";
import { NODE_ENV } from "../config/env.js";
import { logger } from "../utils/logger.js";

const requestLogger = morgan((tokens, req, res) => {
  const responseTime = tokens["response-time"](req, res);
  const status = tokens.status(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const ip = tokens["remote-addr"](req, res);

  logger.info(`${method} ${url} ${status} ${responseTime}ms - ${ip}`, {
    requestId: req.id,
    method,
    route: req.originalUrl,
    status: Number(status),
    responseTime: Number(responseTime),
    ip,
    ...(NODE_ENV !== "production" && {
      userAgent: req.headers["user-agent"],
    }),
  });

  return null;
});

export default requestLogger;
