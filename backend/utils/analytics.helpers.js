export const parseBrowserFromUserAgent = (userAgent) => {
  if (!userAgent) return "Other";

  const ua = userAgent.toLowerCase();

  if (ua.includes("edg/") || ua.includes("edge/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (
    ua.includes("safari/") &&
    !ua.includes("chrome/") &&
    !ua.includes("chromium")
  )
    return "Safari";

  return "Other";
};

export const extractReferrerDomain = (referrer) => {
  if (!referrer || typeof referrer !== "string") return null;

  try {
    const url = new URL(referrer.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    return url.hostname.toLowerCase().replace(/^www\./i, "") || null;
  } catch {
    return null;
  }
};

export const formatBrowserStats = (rows) => {
  const stats = {};
  for (const row of rows)
    if (row.browser) stats[row.browser] = Number(row.clicks);

  return stats;
};

export const formatTopReferrers = (rows) =>
  rows.map((row) => ({
    source: row.source ?? row.referrer,
    count: Number(row.count ?? row.clicks),
  }));
