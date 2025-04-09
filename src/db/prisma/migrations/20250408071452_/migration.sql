/*
  Warnings:

  - You are about to drop the column `departure` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `departure` on the `EstimateRequest` table. All the data in the column will be lost.
  - Added the required column `departureAddress` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureAddress` to the `EstimateRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Estimate" DROP COLUMN "departure",
ADD COLUMN     "departureAddress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EstimateRequest" DROP COLUMN "departure",
ADD COLUMN     "departureAddress" TEXT NOT NULL;
