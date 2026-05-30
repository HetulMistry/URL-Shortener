-- AlterTable
ALTER TABLE "analytics" ADD COLUMN "referrer" TEXT;

-- CreateIndex
CREATE INDEX "analytics_referrer_idx" ON "analytics"("referrer");
