import prisma from "../config/client.js";
import { nanoid } from "nanoid";
import {
  SHORT_CODE_LENGTH,
  RESERVED_KEYWORDS,
} from "../constants/url.constants.js";
import AppError from "../utils/AppError.js";
import {
  deleteCachedUrl,
  getCachedUrl,
  invalidateUrlCache,
  setCachedUrl,
} from "./cache.service.js";

const trackClickAndAnalytics = async (urlId, reqInfo) => {
  await prisma.$transaction([
    prisma.url.update({
      where: { id: urlId },
      data: { clicks: { increment: 1 } },
    }),
    prisma.analytics.create({
      data: {
        urlId,
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      },
    }),
  ]);
};

const assertUrlNotExpired = (expiresAt) => {
  if (expiresAt && new Date() > new Date(expiresAt)) {
    throw new AppError("URL has expired", 410);
  }
};

export const createShortUrl = async (
  originalUrl,
  customAlias,
  expiresAt,
  userId,
) => {
  let shortCode = customAlias;

  if (customAlias) {
    const lowerAlias = customAlias.toLowerCase();

    // Validate alias format
    const aliasRegex = /^[a-zA-Z0-9_-]+$/;
    if (!aliasRegex.test(lowerAlias))
      throw new AppError(
        "Invalid custom alias. Only alphanumeric characters, dashes, and underscores are allowed.",
        400,
      );

    if (lowerAlias.length < 3 || lowerAlias.length > 50)
      throw new AppError("Alias must be between 3 and 50 characters", 400);

    // Check reserved keywords
    if (RESERVED_KEYWORDS.includes(lowerAlias))
      throw new AppError("Custom alias is a reserved keyword.", 400);

    // Check uniqueness
    const existing = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode: lowerAlias }, { customAlias: lowerAlias }],
      },
    });

    if (existing) throw new AppError("Alias already taken", 409);

    customAlias = lowerAlias;
    shortCode = lowerAlias;
  } else {
    shortCode = nanoid(SHORT_CODE_LENGTH);
    let existing = await prisma.url.findUnique({ where: { shortCode } });
    while (existing) {
      shortCode = nanoid(SHORT_CODE_LENGTH);
      existing = await prisma.url.findUnique({ where: { shortCode } });
    }
  }

  const newUrl = await prisma.url.create({
    data: {
      originalUrl,
      shortCode,
      customAlias,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      userId,
    },
  });

  return newUrl;
};

export const getOriginalUrlByShortCode = async (shortCode, reqInfo) => {
  const lowerShortCode = shortCode.toLowerCase();

  const cached = await getCachedUrl(lowerShortCode);
  if (cached) {
    try {
      assertUrlNotExpired(cached.expiresAt);
    } catch (error) {
      await deleteCachedUrl(lowerShortCode);
      throw error;
    }

    await trackClickAndAnalytics(cached.id, reqInfo);
    return cached.originalUrl;
  }

  const url = await prisma.url.findFirst({
    where: {
      OR: [{ shortCode: lowerShortCode }, { customAlias: lowerShortCode }],
    },
  });

  if (!url) return null;

  assertUrlNotExpired(url.expiresAt);

  await setCachedUrl(lowerShortCode, url);
  await trackClickAndAnalytics(url.id, reqInfo);

  return url.originalUrl;
};

export const getUserUrls = async (userId, { page, limit, search }) => {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(search && {
      OR: [
        { originalUrl: { contains: search, mode: "insensitive" } },
        { shortCode: { contains: search, mode: "insensitive" } },
        { customAlias: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, urls] = await prisma.$transaction([
    prisma.url.count({ where }),
    prisma.url.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { urls, total, totalPages };
};

export const deleteUrl = async (id) => {
  const url = await prisma.url.findUnique({ where: { id } });
  if (!url) throw new AppError("URL not found", 404);

  await invalidateUrlCache(url);

  await prisma.$transaction([
    prisma.analytics.deleteMany({ where: { urlId: id } }),
    prisma.url.delete({ where: { id } }),
  ]);
};

export const updateUrl = async (id, updates) => {
  const existingUrl = await prisma.url.findUnique({ where: { id } });
  if (!existingUrl) throw new AppError("URL not found", 404);

  const { customAlias, expiresAt } = updates;
  const data = {};

  if (customAlias) {
    const lowerAlias = customAlias.toLowerCase();
    const aliasRegex = /^[a-zA-Z0-9_-]+$/;
    if (!aliasRegex.test(lowerAlias))
      throw new AppError(
        "Invalid custom alias. Only alphanumeric characters, dashes, and underscores are allowed.",
        400,
      );
    if (lowerAlias.length < 3 || lowerAlias.length > 50)
      throw new AppError("Alias must be between 3 and 50 characters", 400);
    if (RESERVED_KEYWORDS.includes(lowerAlias))
      throw new AppError("Custom alias is a reserved keyword.", 400);

    const existing = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode: lowerAlias }, { customAlias: lowerAlias }],
        id: { not: id },
      },
    });
    if (existing) throw new AppError("Alias already taken", 409);

    data.customAlias = lowerAlias;
    data.shortCode = lowerAlias;
  }

  if (expiresAt !== undefined) {
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      throw new AppError("Expiration must be a future date", 400);
    }
    data.expiresAt = expiresAt ? new Date(expiresAt) : null;
  }

  const updatedUrl = await prisma.url.update({
    where: { id },
    data,
  });

  await invalidateUrlCache(existingUrl);
  await invalidateUrlCache(updatedUrl);

  return updatedUrl;
};

export const getUrlAnalytics = async (id) => {
  const totalClicks = await prisma.analytics.count({ where: { urlId: id } });

  const uniqueVisitorsGroup = await prisma.analytics.groupBy({
    by: ["ipAddress"],
    where: { urlId: id, ipAddress: { not: null } },
  });
  const uniqueVisitors = uniqueVisitorsGroup.length;

  const recentVisits = await prisma.analytics.findMany({
    where: { urlId: id },
    orderBy: { clickedAt: "desc" },
    take: 10,
  });

  const clicksPerDayRaw = await prisma.$queryRaw`
    SELECT TO_CHAR("clickedAt", 'YYYY-MM-DD') as date, CAST(COUNT(*) AS INTEGER) as clicks
    FROM "analytics"
    WHERE "urlId" = ${id}
    GROUP BY TO_CHAR("clickedAt", 'YYYY-MM-DD')
    ORDER BY date ASC
  `;

  // Format to regular objects instead of Prisma raw response objects
  const clicksPerDay = clicksPerDayRaw.map((row) => ({
    date: row.date,
    clicks: Number(row.clicks),
  }));

  return {
    totalClicks,
    uniqueVisitors,
    clicksPerDay,
    recentVisits,
  };
};
