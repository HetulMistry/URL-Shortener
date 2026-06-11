import prisma from "../config/client.js";
import { parseBrowserFromUserAgent } from "../utils/analytics.helpers.js";
import AppError from "../utils/AppError.js";

const escapeCSV = (value) => {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  )
    return `"${stringValue.replace(/"/g, '""')}"`;

  return stringValue;
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map(escapeCSV).join(",");

  const csvRows = data.map((row) =>
    headers.map((header) => escapeCSV(row[header])).join(","),
  );

  return [csvHeaders, ...csvRows].join("\n");
};

export const streamAnalyticsCsv = async (urlId, res) => {
  const urlData = await prisma.url.findUnique({
    where: { id: urlId },
    include: {
      analytics: {
        orderBy: { clickedAt: "desc" },
        take: 1000,
      },
    },
  });

  if (!urlData) throw new AppError("URL not found", 404);

  const uniqueVisitors = new Set(
    urlData.analytics.map((row) => row.ipAddress).filter(Boolean),
  ).size;

  const summaryCsv = convertToCSV([
    {
      "Short Code": urlData.shortCode,
      "Original URL": urlData.originalUrl,
      "Total Clicks": urlData.clicks,
      "Unique Visitors": uniqueVisitors,
      "Created At": new Date(urlData.createdAt).toISOString(),
      "Expires At": urlData.expiresAt
        ? new Date(urlData.expiresAt).toISOString()
        : "Never",
    },
  ]);

  const visitsCsv =
    urlData.analytics.length > 0
      ? `\n\n${convertToCSV(
          urlData.analytics.map((row) => ({
            Timestamp: new Date(row.clickedAt).toISOString(),
            Browser: parseBrowserFromUserAgent(row.userAgent),
            Referrer: row.referrer || "Direct",
            "IP Address": row.ipAddress || "Unknown",
            "User Agent": row.userAgent || "Unknown",
          })),
        )}`
      : "";

  const csv = `${summaryCsv}${visitsCsv}`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="analytics-${urlId}-${Date.now()}.csv"`,
  );
  res.send(csv);
};
