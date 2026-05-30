import * as urlService from "../services/url.service.js";
import { streamAnalyticsCsv } from "../services/export.service.js";
import { buildShortUrl, generateQrCode } from "../services/qr.service.js";
import { APP_BASE_URL } from "../config/env.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const createUrl = async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user.id;

    const newUrl = await urlService.createShortUrl(
      originalUrl,
      customAlias,
      expiresAt,
      userId,
    );

    return sendSuccess(res, 201, { url: newUrl });
  } catch (error) {
    next(error);
  }
};

export const getUserUrls = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, search } = req.validatedQuery;

    const { urls, total, totalPages } = await urlService.getUserUrls(userId, {
      page,
      limit,
      search,
    });

    return sendSuccess(res, 200, {
      page,
      limit,
      total,
      totalPages,
      urls,
    });
  } catch (error) {
    next(error);
  }
};

export const getUrlDetails = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, { url: req.urlData });
  } catch (error) {
    next(error);
  }
};

export const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    await urlService.deleteUrl(id);

    return sendSuccess(res, 200, { message: "URL deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUrlAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.validatedQuery || {};
    const analyticsData = await urlService.getUrlAnalytics(id, {
      startDate,
      endDate,
    });

    return sendSuccess(res, 200, analyticsData);
  } catch (error) {
    next(error);
  }
};

export const exportUrlAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    await streamAnalyticsCsv(id, res);
  } catch (error) {
    next(error);
  }
};

export const getUrlQrCode = async (req, res, next) => {
  try {
    const { format } = req.validatedQuery;
    const shortUrl = buildShortUrl(APP_BASE_URL, req.urlData.shortCode);

    if (format === "base64") {
      const dataUrl = await generateQrCode(shortUrl, "base64");
      return sendSuccess(res, 200, { qrCode: dataUrl, shortUrl });
    }

    const buffer = await generateQrCode(shortUrl, "png");
    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const redirectToOriginalUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const reqInfo = urlService.buildRedirectRequestInfo(req);

    const originalUrl = await urlService.getOriginalUrlByShortCode(
      shortCode,
      reqInfo,
    );

    if (!originalUrl) return sendError(res, 404, "Short URL not found", req.id);

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

    return sendSuccess(res, 200, { url: updatedUrl });
  } catch (error) {
    next(error);
  }
};
