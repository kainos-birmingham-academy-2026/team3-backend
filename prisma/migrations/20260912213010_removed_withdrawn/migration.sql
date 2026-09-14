/*
  Warnings:

  - The values [WITHDRAWN] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('IN_PROGRESS', 'HIRED', 'REJECTED');
ALTER TABLE "public"."Application" ALTER COLUMN "applicationStatus" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "applicationStatus" TYPE "ApplicationStatus_new" USING ("applicationStatus"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "applicationStatus" SET DEFAULT 'IN_PROGRESS';
COMMIT;
