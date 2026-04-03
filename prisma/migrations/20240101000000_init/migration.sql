-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE "ClubCategory" AS ENUM ('STEM', 'HUMANITIES', 'ARTS', 'BUSINESS', 'SERVICE', 'SPORTS', 'FAITH', 'OTHER');
CREATE TYPE "CommitmentLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
CREATE TYPE "MembershipRole" AS ENUM ('MEMBER', 'OFFICER', 'PRESIDENT', 'FACULTY_ADVISOR');
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WAITLISTED');
CREATE TYPE "PollVisibility" AS ENUM ('PUBLIC', 'ANONYMOUS');
CREATE TYPE "ChangelogType" AS ENUM ('FEATURE', 'IMPROVEMENT', 'BUG_FIX', 'CLUB_UPDATE', 'ANNOUNCEMENT');
CREATE TYPE "ResourceType" AS ENUM ('LINK', 'DOCUMENT', 'PDF', 'SPREADSHEET', 'VIDEO', 'OTHER');
CREATE TYPE "EventType" AS ENUM ('MEETING', 'COMPETITION', 'SOCIAL', 'SERVICE', 'SCHOOL_WIDE', 'OTHER');

-- CreateTable: NextAuth
CREATE TABLE "Account" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL, "refresh_token" TEXT, "access_token" TEXT,
    "expires_at" INTEGER, "token_type" TEXT, "scope" TEXT, "id_token" TEXT, "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Session" (
    "id" TEXT NOT NULL, "sessionToken" TEXT NOT NULL, "userId" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL, "token" TEXT NOT NULL, "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable: User
CREATE TABLE "User" (
    "id" TEXT NOT NULL, "name" TEXT, "email" TEXT, "emailVerified" TIMESTAMP(3), "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT', "grade" INTEGER, "graduationYear" INTEGER,
    "bio" TEXT, "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifLastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Club
CREATE TABLE "Club" (
    "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "shortName" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '🏛️', "tagline" TEXT, "description" TEXT NOT NULL,
    "category" "ClubCategory" NOT NULL, "commitment" "CommitmentLevel" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[], "isActive" BOOLEAN NOT NULL DEFAULT true, "requiresApp" BOOLEAN NOT NULL DEFAULT false,
    "maxMembers" INTEGER, "meetingRoom" TEXT, "meetingDay" TEXT, "meetingTime" TEXT,
    "gradientFrom" TEXT NOT NULL DEFAULT '#0E1B2C', "gradientTo" TEXT NOT NULL DEFAULT '#152438',
    "bannerUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Membership
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "clubId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER', "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Post
CREATE TABLE "Post" (
    "id" TEXT NOT NULL, "clubId" TEXT NOT NULL, "authorId" TEXT NOT NULL, "title" TEXT NOT NULL,
    "content" TEXT NOT NULL, "imageUrl" TEXT, "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Event
CREATE TABLE "Event" (
    "id" TEXT NOT NULL, "clubId" TEXT, "title" TEXT NOT NULL, "description" TEXT,
    "location" TEXT, "type" "EventType" NOT NULL DEFAULT 'MEETING',
    "startTime" TIMESTAMP(3) NOT NULL, "endTime" TIMESTAMP(3) NOT NULL,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false, "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "googleCalId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Resource
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL, "clubId" TEXT NOT NULL, "uploaderId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'LINK', "url" TEXT NOT NULL, "description" TEXT,
    "size" INTEGER, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AppForm
CREATE TABLE "AppForm" (
    "id" TEXT NOT NULL, "clubId" TEXT NOT NULL, "fields" JSONB NOT NULL, "deadline" TIMESTAMP(3),
    "maxSlots" INTEGER, "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AppForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Application
CREATE TABLE "Application" (
    "id" TEXT NOT NULL, "clubId" TEXT NOT NULL, "applicantId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED', "responses" JSONB NOT NULL,
    "reviewNotes" TEXT, "reviewedBy" TEXT, "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Poll + PollOption + Vote
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL, "clubId" TEXT, "createdById" TEXT NOT NULL, "title" TEXT NOT NULL,
    "description" TEXT, "visibility" "PollVisibility" NOT NULL DEFAULT 'ANONYMOUS',
    "endsAt" TIMESTAMP(3), "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PollOption" (
    "id" TEXT NOT NULL, "pollId" TEXT NOT NULL, "text" TEXT NOT NULL, "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL, "pollId" TEXT NOT NULL, "optionId" TEXT NOT NULL, "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "title" TEXT NOT NULL, "body" TEXT NOT NULL,
    "type" TEXT NOT NULL, "refId" TEXT, "refType" TEXT, "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ChangelogEntry
CREATE TABLE "ChangelogEntry" (
    "id" TEXT NOT NULL, "type" "ChangelogType" NOT NULL, "title" TEXT NOT NULL, "content" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false, "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChangelogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Attendance
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL, "clubId" TEXT NOT NULL, "eventId" TEXT, "date" TIMESTAMP(3) NOT NULL,
    "qrCode" TEXT, "isOpen" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL, "sessionId" TEXT NOT NULL, "userId" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true, "checkIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable: NHS Cache
CREATE TABLE "NhsHoursCache" (
    "id" TEXT NOT NULL, "airtableId" TEXT NOT NULL, "studentName" TEXT NOT NULL, "studentEmail" TEXT,
    "grade" INTEGER, "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requiredHours" DOUBLE PRECISION NOT NULL DEFAULT 0, "activities" JSONB NOT NULL DEFAULT '[]',
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "rawData" JSONB,
    CONSTRAINT "NhsHoursCache_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");
CREATE UNIQUE INDEX "Membership_userId_clubId_key" ON "Membership"("userId", "clubId");
CREATE UNIQUE INDEX "AppForm_clubId_key" ON "AppForm"("clubId");
CREATE UNIQUE INDEX "Application_clubId_applicantId_key" ON "Application"("clubId", "applicantId");
CREATE UNIQUE INDEX "Vote_pollId_userId_key" ON "Vote"("pollId", "userId");
CREATE UNIQUE INDEX "AttendanceSession_qrCode_key" ON "AttendanceSession"("qrCode");
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_userId_key" ON "AttendanceRecord"("sessionId", "userId");
CREATE UNIQUE INDEX "NhsHoursCache_airtableId_key" ON "NhsHoursCache"("airtableId");

-- Indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Club_slug_idx" ON "Club"("slug");
CREATE INDEX "Club_category_idx" ON "Club"("category");
CREATE INDEX "Club_isActive_idx" ON "Club"("isActive");
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");
CREATE INDEX "Membership_clubId_idx" ON "Membership"("clubId");
CREATE INDEX "Post_clubId_createdAt_idx" ON "Post"("clubId", "createdAt");
CREATE INDEX "Event_clubId_startTime_idx" ON "Event"("clubId", "startTime");
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");
CREATE INDEX "Resource_clubId_idx" ON "Resource"("clubId");
CREATE INDEX "Application_clubId_status_idx" ON "Application"("clubId", "status");
CREATE INDEX "Poll_isActive_idx" ON "Poll"("isActive");
CREATE INDEX "PollOption_pollId_idx" ON "PollOption"("pollId");
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- Foreign Keys
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE;
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id");
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE;
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "AppForm" ADD CONSTRAINT "AppForm_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id");
ALTER TABLE "Application" ADD CONSTRAINT "Application_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id");
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
