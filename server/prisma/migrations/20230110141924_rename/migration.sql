/*
  Warnings:

  - You are about to drop the column `date_lit` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `lits_plan` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `lits_real` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `operationId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `Lit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Operation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date_night` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nights_plan` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_operationId_fkey";

-- DropForeignKey
ALTER TABLE "Operation" DROP CONSTRAINT "Operation_diseaseId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "date_lit",
DROP COLUMN "lits_plan",
DROP COLUMN "lits_real",
DROP COLUMN "operationId",
ADD COLUMN     "date_night" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "nights_plan" INTEGER NOT NULL,
ADD COLUMN     "nigths_real" INTEGER,
ADD COLUMN     "surgeryId" INTEGER;

-- DropTable
DROP TABLE "Lit";

-- DropTable
DROP TABLE "Operation";

-- CreateTable
CREATE TABLE "Nights" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Nights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Surgeries" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "diseaseId" TEXT NOT NULL,

    CONSTRAINT "Surgeries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nights_id_key" ON "Nights"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Nights_date_key" ON "Nights"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Surgeries_id_key" ON "Surgeries"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Surgeries_date_key" ON "Surgeries"("date");

-- AddForeignKey
ALTER TABLE "Surgeries" ADD CONSTRAINT "Surgeries_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgeries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
