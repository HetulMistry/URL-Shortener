export const validateUrl = (req, res, next) => {
  const { originalUrl } = req.body;

  if (!originalUrl)
    return res.status(400).json({ message: "Original URL is required" });

  try {
    const parsedUrl = new URL(originalUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res
        .status(400)
        .json({ message: "Only HTTP and HTTPS URLs are allowed" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Invalid URL format" });
  }

  next();
};
