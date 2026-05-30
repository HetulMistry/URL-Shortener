import morgan from "morgan";
import { NODE_ENV } from "../config/env.js";

morgan.token("timestamp", () => new Date().toISOString());

const developmentFormat =
  ":timestamp :method :url :status :response-time ms - :remote-addr :user-agent";

const productionFormat =
  ":timestamp :method :url :status :response-time ms - :remote-addr";

const requestLogger = morgan(
  NODE_ENV === "production" ? productionFormat : developmentFormat,
);

export default requestLogger;
