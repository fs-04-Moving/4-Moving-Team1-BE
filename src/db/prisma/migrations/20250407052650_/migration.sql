-- AlterTable
ALTER TABLE "Estimate" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
