/*
  Warnings:

  - The `important` column on the `Group` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "metroId" INTEGER,
DROP COLUMN "important",
ADD COLUMN     "important" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_metroId_fkey" FOREIGN KEY ("metroId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
