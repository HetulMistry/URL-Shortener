import AppError from "./AppError.js";

export const validateOriginalUrl = (originalUrl) => {
  if (!originalUrl) throw new AppError("Original URL is required", 400);

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch {
    throw new AppError("Invalid URL format", 400);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:")
    throw new AppError("Only HTTP and HTTPS URLs are allowed", 400);

  return originalUrl;
};
