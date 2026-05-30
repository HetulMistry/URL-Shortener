import prisma from "../config/client.js";

const verifyUrlOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const url = await prisma.url.findUnique({
      where: { id },
    });

    if (!url) return res.status(404).json({ message: "URL not found" });

    if (url.userId !== userId)
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this URL" });

    req.urlData = url;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyUrlOwnership;
