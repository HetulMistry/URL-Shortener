import crypto from "crypto";

const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers["x-request-id"];
  req.id =
    typeof incomingId === "string" && incomingId.trim()
      ? incomingId.trim()
      : crypto.randomBytes(4).toString("hex");

  res.setHeader("X-Request-Id", req.id);
  next();
};

export default requestIdMiddleware;
