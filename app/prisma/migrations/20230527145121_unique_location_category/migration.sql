/*
  Warnings:

  - A unique constraint covering the columns `[type,name]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_level_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Location_type_name_key" ON "Location"("type", "name");
