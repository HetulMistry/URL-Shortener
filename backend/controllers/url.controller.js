import * as urlService from "../services/url.service.js";

export const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user.id; // Comes from auth middleware

    const newUrl = await urlService.createShortUrl(
      originalUrl,
      customAlias,
      expiresAt,
      userId,
    );

    return res.status(201).json({
      success: true,
      url: newUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const search = req.query.search || "";

    const { urls, total, totalPages } = await urlService.getUserUrls(userId, {
      page,
      limit,
      search,
    });

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      data: urls,
    });
  } catch (error) {
    next(error);
  }
};

export const getUrlDetails = async (req, res, next) => {
  try {
    // req.urlData is populated by verifyUrlOwnership middleware
    return res.status(200).json({
      success: true,
      data: req.urlData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    await urlService.deleteUrl(id);

    return res.status(200).json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUrlAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analyticsData = await urlService.getUrlAnalytics(id);

    return res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    next(error);
  }
};

export const redirectToOriginalUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    // Collect basic analytics data
    const reqInfo = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    };

    const originalUrl = await urlService.getOriginalUrlByShortCode(
      shortCode,
      reqInfo,
    );

    if (!originalUrl)
      return res.status(404).json({ message: "Short URL not found" });

    // Redirect to the original URL
    return res.redirect(originalUrl);
  } catch (error) {
    next(error);
  }
};

export const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customAlias, expiresAt } = req.body;

    const updatedUrl = await urlService.updateUrl(id, {
      customAlias,
      expiresAt,
    });

    return res.status(200).json({
      success: true,
      data: updatedUrl,
    });
  } catch (error) {
    next(error);
  }
};
