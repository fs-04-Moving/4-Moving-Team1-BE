/*
  Warnings:

  - You are about to drop the `GeneralProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RiderProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GeneralProfile" DROP CONSTRAINT "GeneralProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "RiderProfile" DROP CONSTRAINT "RiderProfile_userId_fkey";

-- DropTable
DROP TABLE "GeneralProfile";

-- DropTable
DROP TABLE "RiderProfile";

-- CreateTable
CREATE TABLE "WorkProfile" (
    "id" TEXT NOT NULL,
    "profileImage" TEXT,
    "nickname" TEXT,
    "experience" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "services" "ServiceType"[],
    "serviceAreas" "Area"[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "WorkProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "profileImage" TEXT,
    "nickname" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "livingAreas" "Area"[],

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkProfile" ADD CONSTRAINT "WorkProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
