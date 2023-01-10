/*
  Warnings:

  - You are about to drop the `Nights` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Surgeries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_surgeryId_fkey";

-- DropForeignKey
ALTER TABLE "Surgeries" DROP CONSTRAINT "Surgeries_diseaseId_fkey";

-- DropTable
DROP TABLE "Nights";

-- DropTable
DROP TABLE "Surgeries";

-- CreateTable
CREATE TABLE "Night" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Night_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Surgery" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "diseaseId" TEXT NOT NULL,

    CONSTRAINT "Surgery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Night_id_key" ON "Night"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Night_date_key" ON "Night"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Surgery_id_key" ON "Surgery"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Surgery_date_key" ON "Surgery"("date");

-- AddForeignKey
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_diseaseId_fkey" FOREIGN KEY ("diseaseId") REFERENCES "Disease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
