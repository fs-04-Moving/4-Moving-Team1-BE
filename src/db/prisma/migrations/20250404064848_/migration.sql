/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Estimate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Estimate" DROP COLUMN "isCompleted",
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;
