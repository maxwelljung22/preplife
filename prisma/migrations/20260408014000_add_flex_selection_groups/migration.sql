-- CreateTable
CREATE TABLE "FlexSelectionGroup" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "studentIds" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FlexSelectionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlexSelectionGroup_ownerId_createdAt_idx" ON "FlexSelectionGroup"("ownerId", "createdAt");

-- AddForeignKey
ALTER TABLE "FlexSelectionGroup" ADD CONSTRAINT "FlexSelectionGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
