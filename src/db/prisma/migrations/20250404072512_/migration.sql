/*
  Warnings:

  - Made the column `nickname` on table `WorkerProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkerProfile" ALTER COLUMN "nickname" SET NOT NULL;
