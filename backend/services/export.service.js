import prisma from "../config/client.js";

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

  const csvRows = data.map((row) => {
    return headers.map((header) => escapeCSV(row[header])).join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};

export const streamAnalyticsCsv = async (urlId, res) => {
  try {
    const urlData = await prisma.url.findUnique({
      where: { id: urlId },
      include: {
        analytics: {
          orderBy: { timestamp: "desc" },
          take: 1000,
        },
      },
    });

    if (!urlData) throw new Error("URL not found");

    const csvData = [
      {
        "Short Code": urlData.shortCode,
        "Original URL": urlData.originalUrl,
        "Total Clicks": urlData.clicks,
        "Unique Visitors": urlData.uniqueVisitors,
        "Created At": new Date(urlData.createdAt).toISOString(),
        "Expires At": urlData.expiresAt
          ? new Date(urlData.expiresAt).toISOString()
          : "Never",
      },
    ];

    if (urlData.analytics && urlData.analytics.length > 0) {
      const analyticsData = urlData.analytics.map((a) => ({
        Timestamp: new Date(a.timestamp).toISOString(),
        Browser: a.browser || "Unknown",
        Referrer: a.referrer || "Direct",
        "User Agent": a.userAgent || "Unknown",
      }));

      csvData.push({}, ...analyticsData);
    }

    const csv = convertToCSV(csvData);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-${urlId}-${Date.now()}.csv"`,
    );
    res.send(csv);
  } catch (error) {
    throw error;
  }
};
