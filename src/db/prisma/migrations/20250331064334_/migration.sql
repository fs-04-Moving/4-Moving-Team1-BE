/*
  Warnings:

  - You are about to drop the column `livingAreas` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "livingAreas",
ADD COLUMN     "services" "ServiceType"[];
