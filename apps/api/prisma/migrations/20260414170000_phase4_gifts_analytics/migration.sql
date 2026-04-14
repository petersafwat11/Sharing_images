-- Phase 4: add isPublic to portraits, Gift model, ThemeAnalytics model

-- Portrait: add isPublic flag (gallery opt-in)
ALTER TABLE "portraits" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "portraits_isPublic_createdAt_idx" ON "portraits"("isPublic", "createdAt");

-- Gift model
CREATE TABLE "gifts" (
    "id"            TEXT         NOT NULL,
    "portraitId"    TEXT         NOT NULL,
    "recipientName" TEXT         NOT NULL,
    "message"       TEXT,
    "claimed"       BOOLEAN      NOT NULL DEFAULT false,
    "claimedAt"     TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gifts_portraitId_idx" ON "gifts"("portraitId");

ALTER TABLE "gifts" ADD CONSTRAINT "gifts_portraitId_fkey"
  FOREIGN KEY ("portraitId") REFERENCES "portraits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ThemeAnalytics model (daily counters, flushed from Redis)
CREATE TABLE "theme_analytics" (
    "id"          TEXT         NOT NULL,
    "themeSlug"   TEXT         NOT NULL,
    "date"        TIMESTAMP(3) NOT NULL,
    "starts"      INTEGER      NOT NULL DEFAULT 0,
    "completions" INTEGER      NOT NULL DEFAULT 0,
    "failures"    INTEGER      NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_analytics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "theme_analytics_themeSlug_date_key" ON "theme_analytics"("themeSlug", "date");
CREATE INDEX "theme_analytics_date_idx" ON "theme_analytics"("date");
