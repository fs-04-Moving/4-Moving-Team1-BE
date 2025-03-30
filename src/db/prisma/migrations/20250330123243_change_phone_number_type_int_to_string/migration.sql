/*
  Warnings:

  - The values [Seoul,Gyeonggi,Incheon,Gangwon,Chungbuk,Chungnam,Sejong,Daejeon,Jeonbuk,Jeonnam,Gwangju,Gyeongbuk,Gyeongnam,Daegu,Ulsan,Busan] on the enum `Area` will be removed. If these variants are still used in the database, this will fail.
  - The values [Active,Inactive,Confirmed] on the enum `EstimateRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [General,Assigned,Rejected] on the enum `EstimateStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [General,Rider] on the enum `ROLE` will be removed. If these variants are still used in the database, this will fail.
  - The values [SmallMove,HomeMove,OfficeMove] on the enum `ServiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Area_new" AS ENUM ('seoul', 'gyeonggi', 'incheon', 'gangwon', 'chungbuk', 'chungnam', 'sejong', 'daejeon', 'jeonbuk', 'jeonnam', 'gwangju', 'gyeongbuk', 'gyeongnam', 'daegu', 'ulsan', 'busan', 'Jeju');
ALTER TABLE "RiderProfile" ALTER COLUMN "serviceAreas" TYPE "Area_new"[] USING ("serviceAreas"::text::"Area_new"[]);
ALTER TABLE "GeneralProfile" ALTER COLUMN "livingAreas" TYPE "Area_new"[] USING ("livingAreas"::text::"Area_new"[]);
ALTER TYPE "Area" RENAME TO "Area_old";
ALTER TYPE "Area_new" RENAME TO "Area";
DROP TYPE "Area_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EstimateRequestStatus_new" AS ENUM ('active', 'inactive', 'confirmed');
ALTER TABLE "EstimateRequest" ALTER COLUMN "status" TYPE "EstimateRequestStatus_new" USING ("status"::text::"EstimateRequestStatus_new");
ALTER TYPE "EstimateRequestStatus" RENAME TO "EstimateRequestStatus_old";
ALTER TYPE "EstimateRequestStatus_new" RENAME TO "EstimateRequestStatus";
DROP TYPE "EstimateRequestStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EstimateStatus_new" AS ENUM ('general', 'assigned', 'rejected');
ALTER TABLE "Estimate" ALTER COLUMN "status" TYPE "EstimateStatus_new" USING ("status"::text::"EstimateStatus_new");
ALTER TYPE "EstimateStatus" RENAME TO "EstimateStatus_old";
ALTER TYPE "EstimateStatus_new" RENAME TO "EstimateStatus";
DROP TYPE "EstimateStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ROLE_new" AS ENUM ('general', 'rider');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "ROLE_new" USING ("role"::text::"ROLE_new");
ALTER TYPE "ROLE" RENAME TO "ROLE_old";
ALTER TYPE "ROLE_new" RENAME TO "ROLE";
DROP TYPE "ROLE_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'general';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ServiceType_new" AS ENUM ('smallMove', 'homeMove', 'officeMove');
ALTER TABLE "RiderProfile" ALTER COLUMN "services" TYPE "ServiceType_new"[] USING ("services"::text::"ServiceType_new"[]);
ALTER TABLE "EstimateRequest" ALTER COLUMN "movingType" TYPE "ServiceType_new" USING ("movingType"::text::"ServiceType_new");
ALTER TABLE "Estimate" ALTER COLUMN "movingType" TYPE "ServiceType_new" USING ("movingType"::text::"ServiceType_new");
ALTER TYPE "ServiceType" RENAME TO "ServiceType_old";
ALTER TYPE "ServiceType_new" RENAME TO "ServiceType";
DROP TYPE "ServiceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "phoneNumber" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET DEFAULT 'general';
