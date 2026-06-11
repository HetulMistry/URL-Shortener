import prisma from "../config/client.js";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { SHORT_CODE_LENGTH } from "../constants/url.constants.js";
import AppError from "../utils/AppError.js";
import { validateCustomAlias } from "../utils/alias.validation.js";
import { validateOriginalUrl } from "../utils/url.validation.js";
import {
  assertFutureExpiration,
  assertNotExpired,
} from "../utils/expiration.js";
import { extractReferrerDomain } from "../utils/analytics.helpers.js";
import {
  formatBrowserStats,
  formatTopReferrers,
} from "../utils/analytics.helpers.js";
import {
  deleteCachedUrl,
  getCachedUrl,
  invalidateUrlCache,
  setCachedUrl,
} from "./cache.service.js";
import { logger } from "../utils/logger.js";

const isValidCachedUrl = (cached) =>
  cached &&
  typeof cached === "object" &&
  typeof cached.id === "string" &&
  typeof cached.originalUrl === "string";

const findUrlByShortCode = (code) => {
  const normalized = code.toLowerCase();

  return prisma.url.findFirst({
    where: {
      OR: [
        { shortCode: { equals: normalized, mode: "insensitive" } },
        { customAlias: { equals: normalized, mode: "insensitive" } },
      ],
    },
  });
};

const trackClickAndAnalytics = async (urlId, reqInfo) => {
  if (!urlId || typeof urlId !== "string") return;

  try {
    await prisma.$transaction([
      prisma.url.update({
        where: { id: urlId },
        data: { clicks: { increment: 1 } },
      }),
      prisma.analytics.create({
        data: {
          urlId,
          ipAddress: reqInfo.ip ?? null,
          userAgent: reqInfo.userAgent ?? null,
          referrer: reqInfo.referrer ?? null,
        },
      }),
    ]);
  } catch (error) {
    logger.warn("Failed to record click analytics", {
      urlId,
      message: error.message,
    });
  }
};

export const createShortUrl = async (
  originalUrl,
  customAlias,
  expiresAt,
  userId,
) => {
  validateOriginalUrl(originalUrl);

  let shortCode = customAlias;

  if (customAlias) {
    const normalizedAlias = validateCustomAlias(customAlias);

    const existing = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode: normalizedAlias }, { customAlias: normalizedAlias }],
      },
    });

    if (existing) throw new AppError("Alias already taken", 409);

    customAlias = normalizedAlias;
    shortCode = normalizedAlias;
  } else {
    shortCode = nanoid(SHORT_CODE_LENGTH).toLowerCase();
    let existing = await prisma.url.findUnique({ where: { shortCode } });
    while (existing) {
      shortCode = nanoid(SHORT_CODE_LENGTH).toLowerCase();
      existing = await prisma.url.findUnique({ where: { shortCode } });
    }
  }

  if (expiresAt) assertFutureExpiration(expiresAt);

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
  if (isValidCachedUrl(cached)) {
    try {
      assertNotExpired(cached.expiresAt);
    } catch (error) {
      await deleteCachedUrl(lowerShortCode);
      throw error;
    }

    await trackClickAndAnalytics(cached.id, reqInfo);
    return cached.originalUrl;
  }

  if (cached) await deleteCachedUrl(lowerShortCode);

  const url = await findUrlByShortCode(lowerShortCode);

  if (!url) return null;

  assertNotExpired(url.expiresAt);

  await setCachedUrl(lowerShortCode, url);
  await trackClickAndAnalytics(url.id, reqInfo);

  return url.originalUrl;
};

export const buildRedirectRequestInfo = (req) => ({
  ip: req.ip || req.socket?.remoteAddress,
  userAgent: req.headers["user-agent"],
  referrer: extractReferrerDomain(
    typeof req.get === "function"
      ? req.get("referer") || req.get("referrer")
      : req.headers.referer || req.headers.referrer,
  ),
});

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
    const normalizedAlias = validateCustomAlias(customAlias);

    const existing = await prisma.url.findFirst({
      where: {
        OR: [{ shortCode: normalizedAlias }, { customAlias: normalizedAlias }],
        id: { not: id },
      },
    });
    if (existing) throw new AppError("Alias already taken", 409);

    data.customAlias = normalizedAlias;
    data.shortCode = normalizedAlias;
  }

  if (expiresAt !== undefined) {
    if (expiresAt) assertFutureExpiration(expiresAt);

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

const buildAnalyticsDateFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return {};

  const clickedAt = {};
  if (startDate) clickedAt.gte = new Date(`${startDate}T00:00:00.000Z`);
  if (endDate) clickedAt.lte = new Date(`${endDate}T23:59:59.999Z`);

  return { clickedAt };
};

const buildAnalyticsDateConditions = (startDate, endDate) => {
  const conditions = [];
  if (startDate)
    conditions.push(
      Prisma.sql`"clickedAt" >= ${new Date(`${startDate}T00:00:00.000Z`)}`,
    );

  if (endDate)
    conditions.push(
      Prisma.sql`"clickedAt" <= ${new Date(`${endDate}T23:59:59.999Z`)}`,
    );

  return conditions;
};

export const getUrlAnalytics = async (id, { startDate, endDate } = {}) => {
  const dateFilter = buildAnalyticsDateFilter(startDate, endDate);
  const dateConditions = buildAnalyticsDateConditions(startDate, endDate);
  const dateSql =
    dateConditions.length > 0
      ? Prisma.sql`AND ${Prisma.join(dateConditions, " AND ")}`
      : Prisma.empty;

  const totalClicks = await prisma.analytics.count({
    where: { urlId: id, ...dateFilter },
  });

  const uniqueVisitorsGroup = await prisma.analytics.groupBy({
    by: ["ipAddress"],
    where: { urlId: id, ipAddress: { not: null }, ...dateFilter },
  });
  const uniqueVisitors = uniqueVisitorsGroup.length;

  const recentVisits = await prisma.analytics.findMany({
    where: { urlId: id, ...dateFilter },
    orderBy: { clickedAt: "desc" },
    take: 10,
  });

  const clicksPerDayRaw = await prisma.$queryRaw`
    SELECT TO_CHAR("clickedAt", 'YYYY-MM-DD') as date, CAST(COUNT(*) AS INTEGER) as clicks
    FROM "analytics"
    WHERE "urlId" = ${id}
    ${dateSql}
    GROUP BY TO_CHAR("clickedAt", 'YYYY-MM-DD')
    ORDER BY date ASC
  `;

  const clicksPerDay = clicksPerDayRaw.map((row) => ({
    date: row.date,
    clicks: Number(row.clicks),
  }));

  const browserStatsRaw = await prisma.$queryRaw`
    SELECT
      CASE
        WHEN "userAgent" ILIKE '%Edg/%' OR "userAgent" ILIKE '%Edge/%' THEN 'Edge'
        WHEN "userAgent" ILIKE '%OPR/%' OR "userAgent" ILIKE '%Opera%' THEN 'Opera'
        WHEN "userAgent" ILIKE '%Firefox/%' THEN 'Firefox'
        WHEN "userAgent" ILIKE '%Chrome/%' AND "userAgent" NOT ILIKE '%Edg/%' THEN 'Chrome'
        WHEN "userAgent" ILIKE '%Safari/%' AND "userAgent" NOT ILIKE '%Chrome/%' THEN 'Safari'
        ELSE 'Other'
      END AS browser,
      CAST(COUNT(*) AS INTEGER) AS clicks
    FROM "analytics"
    WHERE "urlId" = ${id}
      AND "userAgent" IS NOT NULL
      ${dateSql}
    GROUP BY browser
    ORDER BY clicks DESC
  `;

  const topReferrersRaw = await prisma.$queryRaw`
    SELECT "referrer" AS source, CAST(COUNT(*) AS INTEGER) AS count
    FROM "analytics"
    WHERE "urlId" = ${id}
      AND "referrer" IS NOT NULL
      ${dateSql}
    GROUP BY "referrer"
    ORDER BY count DESC, source ASC
    LIMIT 10
  `;

  return {
    totalClicks,
    uniqueVisitors,
    clicksPerDay,
    recentVisits,
    browserStats: formatBrowserStats(browserStatsRaw),
    topReferrers: formatTopReferrers(topReferrersRaw),
  };
};
