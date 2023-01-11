/*
  Warnings:

  - You are about to drop the column `diseaseId` on the `Surgery` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,diseaseName]` on the table `Surgery` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `diseaseName` to the `Surgery` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Surgery" DROP CONSTRAINT "Surgery_diseaseId_fkey";

-- DropIndex
DROP INDEX "Surgery_date_diseaseId_key";

-- AlterTable
ALTER TABLE "Surgery" DROP COLUMN "diseaseId",
ADD COLUMN     "diseaseName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Surgery_date_diseaseName_key" ON "Surgery"("date", "diseaseName");

-- AddForeignKey
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_diseaseName_fkey" FOREIGN KEY ("diseaseName") REFERENCES "Disease"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
