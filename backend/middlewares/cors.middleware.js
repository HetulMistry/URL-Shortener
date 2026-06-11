import cors from "cors";
import { ALLOWED_ORIGINS, NODE_ENV } from "../config/env.js";

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    if (NODE_ENV === "development" && LOCALHOST_ORIGIN.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
  },
  credentials: true,
});

export default corsMiddleware;
