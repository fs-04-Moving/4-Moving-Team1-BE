/*
  Warnings:

  - You are about to drop the column `customerId` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `EstimateRequest` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `workerId` on the `WorkerProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `CustomerProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `WorkerProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `CustomerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `EstimateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `WorkerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CustomerProfile" DROP CONSTRAINT "CustomerProfile_customerId_fkey";

-- DropForeignKey
ALTER TABLE "EstimateRequest" DROP CONSTRAINT "EstimateRequest_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_customerId_fkey";

-- DropForeignKey
ALTER TABLE "WorkerProfile" DROP CONSTRAINT "WorkerProfile_workerId_fkey";

-- DropIndex
DROP INDEX "CustomerProfile_customerId_key";

-- DropIndex
DROP INDEX "WorkerProfile_workerId_key";

-- AlterTable
ALTER TABLE "CustomerProfile" DROP COLUMN "customerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Estimate" DROP COLUMN "customerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EstimateRequest" DROP COLUMN "customerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "customerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkerProfile" DROP COLUMN "workerId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_userId_key" ON "WorkerProfile"("userId");

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateRequest" ADD CONSTRAINT "EstimateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
