/*
  Warnings:

  - You are about to alter the column `bandName` on the `Band` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `capabilityName` on the `Capability` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `location` on the `JobRole` table. All the data in the column will be lost.
  - You are about to alter the column `roleName` on the `JobRole` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[bandName]` on the table `Band` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[capabilityName]` on the table `Capability` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locationId` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `JobRole` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Band" ALTER COLUMN "bandName" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "Capability" ALTER COLUMN "capabilityName" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "location",
ADD COLUMN     "locationId" INTEGER NOT NULL,
ALTER COLUMN "roleName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "closingDate" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "locationId" SERIAL NOT NULL,
    "locationName" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("locationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_locationName_key" ON "Location"("locationName");

-- CreateIndex
CREATE UNIQUE INDEX "Band_bandName_key" ON "Band"("bandName");

-- CreateIndex
CREATE UNIQUE INDEX "Capability_capabilityName_key" ON "Capability"("capabilityName");

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("locationId") ON DELETE RESTRICT ON UPDATE CASCADE;
