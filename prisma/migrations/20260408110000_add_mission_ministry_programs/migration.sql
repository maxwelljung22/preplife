ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MISSION_MINISTRY';

CREATE TYPE "MinistryProgramType" AS ENUM ('SERVICE_OPPORTUNITY', 'KAIROS', 'RETREAT');

CREATE TABLE "MinistryProgram" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "MinistryProgramType" NOT NULL,
  "location" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "registrationDeadline" TIMESTAMP(3),
  "capacity" INTEGER,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
  "colorFrom" TEXT NOT NULL DEFAULT '#8B1A1A',
  "colorTo" TEXT NOT NULL DEFAULT '#D97706',
  "imageUrl" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MinistryProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MinistrySignup" (
  "id" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MinistrySignup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MinistrySignup_programId_userId_key" ON "MinistrySignup"("programId", "userId");
CREATE INDEX "MinistryProgram_type_startDate_idx" ON "MinistryProgram"("type", "startDate");
CREATE INDEX "MinistryProgram_registrationOpen_startDate_idx" ON "MinistryProgram"("registrationOpen", "startDate");
CREATE INDEX "MinistryProgram_createdById_createdAt_idx" ON "MinistryProgram"("createdById", "createdAt");
CREATE INDEX "MinistrySignup_userId_createdAt_idx" ON "MinistrySignup"("userId", "createdAt");

ALTER TABLE "MinistryProgram"
ADD CONSTRAINT "MinistryProgram_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MinistrySignup"
ADD CONSTRAINT "MinistrySignup_programId_fkey"
FOREIGN KEY ("programId") REFERENCES "MinistryProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MinistrySignup"
ADD CONSTRAINT "MinistrySignup_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
