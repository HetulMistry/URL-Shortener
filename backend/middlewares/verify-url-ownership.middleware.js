import prisma from "../config/client.js";
import { sendError } from "../utils/response.js";

const verifyUrlOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const url = await prisma.url.findUnique({
      where: { id },
    });

    if (!url) return sendError(res, 404, "URL not found", req.id);

    if (url.userId !== userId)
      return sendError(res, 403, "Forbidden: You do not own this URL", req.id);

    req.urlData = url;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyUrlOwnership;
