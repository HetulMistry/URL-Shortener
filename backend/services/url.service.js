import prisma from "../config/client.js";
import { nanoid } from "nanoid";
import {
  SHORT_CODE_LENGTH,
  RESERVED_KEYWORDS,
} from "../constants/url.constants.js";
import AppError from "../utils/AppError.js";

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

  const url = await prisma.url.findFirst({
    where: {
      OR: [{ shortCode: lowerShortCode }, { customAlias: lowerShortCode }],
    },
  });

  if (!url) return null;

  // Check Expiration
  if (url.expiresAt && new Date() > new Date(url.expiresAt))
    throw new AppError("URL has expired", 410);

  // Track analytics and increment clicks concurrently using Prisma transaction
  await prisma.$transaction([
    prisma.url.update({
      where: { id: url.id },
      data: { clicks: { increment: 1 } },
    }),
    prisma.analytics.create({
      data: {
        urlId: url.id,
        ipAddress: reqInfo.ip,
        userAgent: reqInfo.userAgent,
      },
    }),
  ]);

  return url.originalUrl;
};

export const getUserUrls = async (userId) => {
  return await prisma.url.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteUrl = async (id) => {
  await prisma.$transaction([
    prisma.analytics.deleteMany({ where: { urlId: id } }),
    prisma.url.delete({ where: { id } }),
  ]);
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

  return {
    totalClicks,
    uniqueVisitors,
    recentVisits,
  };
};
