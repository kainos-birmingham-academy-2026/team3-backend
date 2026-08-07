-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("capabilityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRole" ADD CONSTRAINT "JobRole_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("nameId") ON DELETE RESTRICT ON UPDATE CASCADE;
