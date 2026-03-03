/*
  Warnings:

  - You are about to drop the column `cuisine` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Restaurant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "cuisine",
DROP COLUMN "imageUrl",
ADD COLUMN     "averagePrice" DOUBLE PRECISION,
ADD COLUMN     "bestTimeToVisit" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "popularDishes" TEXT[];
