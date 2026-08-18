/*
  Warnings:

  - A unique constraint covering the columns `[roleName]` on the table `JobRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobRole_roleName_key" ON "JobRole"("roleName");
