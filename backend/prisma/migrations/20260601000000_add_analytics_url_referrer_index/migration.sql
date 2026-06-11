-- Improve per-URL top referrer aggregation performance.
CREATE INDEX "analytics_urlId_referrer_idx" ON "analytics"("urlId", "referrer");
