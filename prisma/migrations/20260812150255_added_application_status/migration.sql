-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('IN_PROGRESS', 'HIRED', 'REJECTED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'IN_PROGRESS';
