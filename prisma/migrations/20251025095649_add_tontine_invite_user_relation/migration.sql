-- AlterTable
ALTER TABLE "TontineInvite" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "TontineInvite" ADD CONSTRAINT "TontineInvite_tontineId_fkey" FOREIGN KEY ("tontineId") REFERENCES "Tontine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TontineInvite" ADD CONSTRAINT "TontineInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
