UPDATE "Band" SET "bandName" = 'Principal' WHERE "bandName" = 'Principal Engineer';
UPDATE "Band" SET "bandName" = 'Manager' WHERE "bandName" = 'Lead Engineer';
UPDATE "Band" SET "bandName" = 'Consultant' WHERE "bandName" = 'Engineer';
UPDATE "Band" SET "bandName" = 'Senior Associate' WHERE "bandName" = 'Senior Engineer';

INSERT INTO "Band" ("bandName", "createdAt", "updatedAt")
VALUES ('Apprentice', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("bandName") DO NOTHING;