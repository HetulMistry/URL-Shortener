import AppError from "./AppError.js";

export const assertNotExpired = (expiresAt) => {
  if (expiresAt && new Date() > new Date(expiresAt))
    throw new AppError("URL has expired", 410);
};

export const assertFutureExpiration = (expiresAt) => {
  if (expiresAt && new Date(expiresAt) <= new Date())
    throw new AppError("Expiration must be a future date", 400);
};
