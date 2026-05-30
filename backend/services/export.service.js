import prisma from "../config/client.js";

const escapeCsvValue = (value) => {
  const stringValue = value ?? "";
  if (/[",\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;

  return stringValue;
};

export const streamAnalyticsCsv = async (urlId, res) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="analytics-${urlId}.csv"`,
  );

  res.write("Date,IP Address,User Agent,Referrer,Timestamp\n");

  const batchSize = 500;
  let skip = 0;

  while (true) {
    const records = await prisma.analytics.findMany({
      where: { urlId },
      orderBy: { clickedAt: "asc" },
      take: batchSize,
      skip,
    });

    if (records.length === 0) break;

    for (const record of records) {
      const date = record.clickedAt.toISOString().slice(0, 10);
      const row = [
        escapeCsvValue(date),
        escapeCsvValue(record.ipAddress),
        escapeCsvValue(record.userAgent),
        escapeCsvValue(record.referrer),
        escapeCsvValue(record.clickedAt.toISOString()),
      ].join(",");

      res.write(`${row}\n`);
    }

    skip += records.length;
    if (records.length < batchSize) break;
  }

  res.end();
};
