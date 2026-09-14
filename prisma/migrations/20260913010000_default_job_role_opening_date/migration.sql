UPDATE "JobRole"
SET "openingDate" = "createdAt"
WHERE "openingDate" IS NULL;

ALTER TABLE "JobRole"
ALTER COLUMN "openingDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "openingDate" SET NOT NULL;