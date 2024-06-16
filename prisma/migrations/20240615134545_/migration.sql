/*
  Warnings:

  - A unique constraint covering the columns `[projectId,userId]` on the table `ProjectPermission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProjectPermission_projectId_userId_key" ON "ProjectPermission"("projectId", "userId");
