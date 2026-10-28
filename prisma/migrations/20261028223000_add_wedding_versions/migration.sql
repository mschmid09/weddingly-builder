ALTER TABLE "WeddingSite" ADD COLUMN "publishedVersionId" TEXT;

CREATE TABLE "WeddingVersion" (
  "id" TEXT NOT NULL,
  "siteId" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WeddingVersion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WeddingVersion_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "WeddingSite"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WeddingVersion_siteId_createdAt_idx" ON "WeddingVersion"("siteId", "createdAt");

INSERT INTO "WeddingVersion" ("id", "siteId", "data", "createdAt")
SELECT site."id" || '-initial', site."id",
  (to_jsonb(site) - ARRAY['id', 'userId', 'createdAt', 'updatedAt', 'publishedVersionId'])
  || jsonb_build_object('events', COALESCE((
    SELECT jsonb_agg(to_jsonb(event) - ARRAY['id', 'siteId', 'createdAt', 'updatedAt'] ORDER BY event."order")
    FROM "Event" event WHERE event."siteId" = site."id"
  ), '[]'::jsonb)),
  site."updatedAt"
FROM "WeddingSite" site;

UPDATE "WeddingSite"
SET "publishedVersionId" = "id" || '-initial'
WHERE "isPublished" = true;