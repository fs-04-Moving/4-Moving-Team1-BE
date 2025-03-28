/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `encryptedPassword` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('General', 'Rider');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('Seoul', 'Gyeonggi', 'Incheon', 'Gangwon', 'Chungbuk', 'Chungnam', 'Sejong', 'Daejeon', 'Jeonbuk', 'Jeonnam', 'Gwangju', 'Gyeongbuk', 'Gyeongnam', 'Daegu', 'Ulsan', 'Busan', 'Jeju');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SmallMove', 'HomeMove', 'OfficeMove');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('General', 'Assigned', 'Rejected');

-- CreateEnum
CREATE TYPE "EstimateRequestStatus" AS ENUM ('Active', 'Inactive', 'Confirmed');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "encryptedPassword" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" INTEGER NOT NULL,
ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'General',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "RiderProfile" (
    "id" TEXT NOT NULL,
    "profileImage" TEXT,
    "nickname" TEXT,
    "experience" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "services" "ServiceType"[],
    "serviceAreas" "Area"[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "RiderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralProfile" (
    "id" TEXT NOT NULL,
    "profileImage" TEXT,
    "nickname" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "livingAreas" "Area"[],

    CONSTRAINT "GeneralProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "writerId" TEXT NOT NULL,
    "star" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movingType" "ServiceType" NOT NULL,
    "movingDate" TIMESTAMP(3) NOT NULL,
    "departure" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EstimateRequestStatus" NOT NULL,

    CONSTRAINT "EstimateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "estimateRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "riderID" TEXT NOT NULL,
    "movingType" "ServiceType" NOT NULL,
    "movingDate" TIMESTAMP(3) NOT NULL,
    "departure" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "price" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectionMessage" TEXT,
    "status" "EstimateStatus" NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RiderProfile" ADD CONSTRAINT "RiderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralProfile" ADD CONSTRAINT "GeneralProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateRequest" ADD CONSTRAINT "EstimateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_estimateRequestId_fkey" FOREIGN KEY ("estimateRequestId") REFERENCES "EstimateRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
