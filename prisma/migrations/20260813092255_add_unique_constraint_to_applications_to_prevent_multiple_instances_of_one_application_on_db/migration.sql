/*
  Warnings:

  - A unique constraint covering the columns `[jobRoleId,userId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Application_jobRoleId_userId_key" ON "Application"("jobRoleId", "userId");
