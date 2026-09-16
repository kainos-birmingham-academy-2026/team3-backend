ALTER TABLE "Band" ADD COLUMN "bandLevel" INTEGER;

UPDATE "Band" SET "bandLevel" = 7 WHERE "bandName" = 'Apprentice';
UPDATE "Band" SET "bandLevel" = 6 WHERE "bandName" = 'Trainee';
UPDATE "Band" SET "bandLevel" = 5 WHERE "bandName" = 'Associate';
UPDATE "Band" SET "bandLevel" = 4 WHERE "bandName" = 'Senior Associate';
UPDATE "Band" SET "bandLevel" = 3 WHERE "bandName" = 'Consultant';
UPDATE "Band" SET "bandLevel" = 2 WHERE "bandName" = 'Manager';
UPDATE "Band" SET "bandLevel" = 1 WHERE "bandName" = 'Principal';

ALTER TABLE "Band" ALTER COLUMN "bandLevel" SET NOT NULL;

CREATE UNIQUE INDEX "Band_bandLevel_key" ON "Band"("bandLevel");
