/*
  Warnings:

  - A unique constraint covering the columns `[date,diseaseId]` on the table `Surgery` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Surgery_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "Surgery_date_diseaseId_key" ON "Surgery"("date", "diseaseId");
