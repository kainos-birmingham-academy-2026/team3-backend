/*
  Warnings:

  - The primary key for the `Band` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nameId` on the `Band` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `JobRole` table. All the data in the column will be lost.
  - Added the required column `description` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfOpenPositions` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibilities` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharepointUrl` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusId` to the `JobRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressLine1` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postcode` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('OPEN', 'CLOSED');

-- DropForeignKey
ALTER TABLE "JobRole" DROP CONSTRAINT "JobRole_bandId_fkey";

-- AlterTable
ALTER TABLE "Band" DROP CONSTRAINT "Band_pkey",
DROP COLUMN "nameId",
ADD COLUMN     "bandId" SERIAL NOT NULL,
ADD CONSTRAINT "Band_pkey" PRIMARY KEY ("bandId");

-- AlterTable
ALTER TABLE "JobRole" DROP COLUMN "status",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "numberOfOpenPositions" INTEGER NOT NULL,
ADD COLUMN     "responsibilities" TEXT NOT NULL,
ADD COLUMN     "sharepointUrl" VARCHAR(255) NOT NULL,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "addressLine1" VARCHAR(255) NOT NULL,
ADD COLUMN     "addressLine2" VARCHAR(255),
ADD COLUMN     "postcode" VARCHAR(20) NOT NULL;

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Status" (
    "statusId" SERIAL NOT NULL,
    "statusName" "StatusEnum" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("statusId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_statusName_key" ON "Status"("statusName");

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("bandId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("statusId") ON DELETE RESTRICT ON UPDATE CASCADE;
