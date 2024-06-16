/*
  Warnings:

  - A unique constraint covering the columns `[name,parentId,projectId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentId_projectId_key" ON "Folder"("name", "parentId", "projectId");
