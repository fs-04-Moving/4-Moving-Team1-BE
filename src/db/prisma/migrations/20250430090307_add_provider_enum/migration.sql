/*
  Warnings:

  - The `provider` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('google', 'kakao', 'naver', 'local');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "provider",
ADD COLUMN     "provider" "Provider" DEFAULT 'local';
