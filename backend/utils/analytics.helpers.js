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
  if (!referrer) return null;

  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./i, "");
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
    referrer: row.referrer,
    clicks: Number(row.clicks),
  }));
