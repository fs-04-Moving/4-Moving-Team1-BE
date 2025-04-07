-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
