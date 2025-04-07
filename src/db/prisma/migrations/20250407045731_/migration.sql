/*
  Warnings:

  - A unique constraint covering the columns `[customerId,workerId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Favorite_customerId_workerId_key" ON "Favorite"("customerId", "workerId");
