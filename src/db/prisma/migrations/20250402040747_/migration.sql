/*
  Warnings:

  - You are about to drop the column `userId` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EstimateRequest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WorkerProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId]` on the table `CustomerProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workerId]` on the table `WorkerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `CustomerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `EstimateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerId` to the `WorkerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomerProfile" DROP CONSTRAINT "CustomerProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "EstimateRequest" DROP CONSTRAINT "EstimateRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkerProfile" DROP CONSTRAINT "WorkerProfile_userId_fkey";

-- DropIndex
DROP INDEX "CustomerProfile_userId_key";

-- DropIndex
DROP INDEX "WorkerProfile_userId_key";

-- AlterTable
ALTER TABLE "CustomerProfile" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Estimate" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EstimateRequest" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkerProfile" DROP COLUMN "userId",
ADD COLUMN     "workerId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON "CustomerProfile"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_workerId_key" ON "WorkerProfile"("workerId");

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateRequest" ADD CONSTRAINT "EstimateRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
