/*
  Warnings:

  - You are about to drop the column `riderID` on the `Estimate` table. All the data in the column will be lost.
  - You are about to drop the column `riderId` on the `Favorite` table. All the data in the column will be lost.
  - You are about to drop the column `riderId` on the `Review` table. All the data in the column will be lost.
  - Added the required column `workerId` to the `Estimate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerId` to the `Favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_riderId_fkey";

-- AlterTable
ALTER TABLE "Estimate" DROP COLUMN "riderID",
ADD COLUMN     "workerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "riderId",
ADD COLUMN     "workerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "riderId",
ADD COLUMN     "workerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
