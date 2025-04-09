/*
  Warnings:

  - Made the column `departureArea` on table `Estimate` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departureArea` on table `EstimateRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Estimate" ALTER COLUMN "departureArea" SET NOT NULL;

-- AlterTable
ALTER TABLE "EstimateRequest" ALTER COLUMN "departureArea" SET NOT NULL;
