import cors from "cors";
import { ALLOWED_ORIGINS } from "../config/env.js";

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
  },
  credentials: true,
});

export default corsMiddleware;
