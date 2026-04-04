-- CreateEnum
CREATE TYPE "ResourceCategory" AS ENUM ('RESOURCE', 'ASSIGNMENT', 'FORM');

-- AlterTable
ALTER TABLE "Club"
ADD COLUMN "workspaceTitle" TEXT,
ADD COLUMN "workspaceDescription" TEXT;

-- AlterTable
ALTER TABLE "Resource"
ADD COLUMN "category" "ResourceCategory" NOT NULL DEFAULT 'RESOURCE',
ADD COLUMN "dueAt" TIMESTAMP(3),
ADD COLUMN "membersOnly" BOOLEAN NOT NULL DEFAULT true;
