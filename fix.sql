-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('customer', 'worker');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('seoul', 'gyeonggi', 'incheon', 'gangwon', 'chungbuk', 'chungnam', 'sejong', 'daejeon', 'jeonbuk', 'jeonnam', 'gwangju', 'gyeongbuk', 'gyeongnam', 'daegu', 'ulsan', 'busan', 'jeju');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('smallMove', 'homeMove', 'officeMove');

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('general', 'assigned', 'rejected');

-- CreateEnum
CREATE TYPE "EstimateRequestStatus" AS ENUM ('active', 'inactive', 'confirmed');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('google', 'kakao', 'naver', 'local');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedPassword" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "hasProfile" BOOLEAN NOT NULL DEFAULT false,
    "role" "ROLE" NOT NULL,
    "hasRequest" BOOLEAN NOT NULL DEFAULT false,
    "provider" "Provider" DEFAULT 'local',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerProfile" (
    "id" TEXT NOT NULL,
    "profileImage" TEXT,
    "nickname" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "services" "ServiceType"[],
    "serviceAreas" "Area"[],
    "workerId" TEXT NOT NULL,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "profileImage" TEXT,
    "customerId" TEXT NOT NULL,
    "livingArea" "Area" NOT NULL,
    "services" "ServiceType"[],

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "star" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "movingDate" TIMESTAMP(3) NOT NULL,
    "destination" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EstimateRequestStatus" NOT NULL DEFAULT 'active',
    "serviceType" "ServiceType" NOT NULL,
    "departureArea" "Area" NOT NULL,
    "departure" TEXT NOT NULL,

    CONSTRAINT "EstimateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "estimateRequestId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "movingDate" TIMESTAMP(3) NOT NULL,
    "destination" TEXT NOT NULL,
    "price" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectionMessage" TEXT,
    "status" "EstimateStatus" NOT NULL,
    "comment" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "departureArea" "Area" NOT NULL,
    "departure" TEXT NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_workerId_key" ON "WorkerProfile"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON "CustomerProfile"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_estimateId_key" ON "Review"("estimateId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_customerId_workerId_key" ON "Favorite"("customerId", "workerId");

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateRequest" ADD CONSTRAINT "EstimateRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_estimateRequestId_fkey" FOREIGN KEY ("estimateRequestId") REFERENCES "EstimateRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

