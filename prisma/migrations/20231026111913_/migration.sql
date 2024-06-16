/*
  Warnings:

  - A unique constraint covering the columns `[name,folderId,projectId]` on the table `File` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_name_folderId_projectId_key" ON "File"("name", "folderId", "projectId");
