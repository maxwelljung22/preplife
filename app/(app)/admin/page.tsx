// app/(app)/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAllNhsRecords } from "@/lib/airtable";
import { AdminClient } from "./admin-client";
import { canAccessAdmin } from "@/lib/roles";
import { isPrismaSchemaMismatchError } from "@/lib/prisma-errors";
import { getFlexBlockWindow } from "@/lib/flex-attendance";

export const metadata = { title: "Admin Panel" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) redirect("/dashboard?error=unauthorized");
  const { date } = getFlexBlockWindow();

  const advisorClubIds: string[] = [];

  const applicationWhere = {};
  const clubSelect = Prisma.validator<Prisma.ClubSelect>()({
    id: true,
    slug: true,
    name: true,
    logoUrl: true,
    emoji: true,
    tagline: true,
    description: true,
    category: true,
    commitment: true,
    tags: true,
    isActive: true,
    requiresApp: true,
    meetingRoom: true,
    meetingDay: true,
    meetingTime: true,
    gradientFrom: true,
    gradientTo: true,
    pendingEditRequest: true,
    pendingEditSubmittedAt: true,
    pendingEditSubmittedById: true,
    pendingEditStatus: true,
    isFlagged: true,
    flagReason: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { memberships: { where: { status: "ACTIVE" } }, posts: true, events: true } },
  });
  const legacyClubSelect = Prisma.validator<Prisma.ClubSelect>()({
    id: true,
    slug: true,
    name: true,
    emoji: true,
    tagline: true,
    description: true,
    category: true,
    commitment: true,
    tags: true,
    isActive: true,
    requiresApp: true,
    meetingRoom: true,
    meetingDay: true,
    meetingTime: true,
    gradientFrom: true,
    gradientTo: true,
    isFlagged: true,
    flagReason: true,
    createdAt: true,
    updatedAt: true,
    _count: { select: { memberships: { where: { status: "ACTIVE" } }, posts: true, events: true } },
  });

  let clubs;
  try {
    clubs = await prisma.club.findMany({
      orderBy: { name: "asc" },
      select: clubSelect,
    });
  } catch (error) {
    if (!isPrismaSchemaMismatchError(error)) throw error;

    clubs = (
      await prisma.club.findMany({
        orderBy: { name: "asc" },
        select: legacyClubSelect,
      })
    ).map((club) => ({
      ...club,
      logoUrl: null,
      pendingEditRequest: null,
      pendingEditSubmittedAt: null,
      pendingEditSubmittedById: null,
      pendingEditStatus: null,
    }));
  }

  const [users, applications, changelog, nhsRecords, totalEvents, attendanceCount, participatingStudents, flexSessions] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
        memberships: {
          where: { status: "ACTIVE" },
          include: { club: { select: { id: true, name: true, emoji: true } } },
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
      },
    }),
    prisma.application.findMany({
      where: applicationWhere,
      orderBy: { createdAt: "desc" },
      include: {
        club: { select: { id: true, name: true, emoji: true } },
        applicant: { select: { name: true, email: true, image: true } },
      },
    }),
    prisma.changelogEntry.findMany({ orderBy: { publishedAt: "desc" } }),
    getAllNhsRecords(),
    prisma.event.count().catch((error) => {
      if (!isPrismaSchemaMismatchError(error)) throw error;
      return 0;
    }),
    prisma.attendanceRecord.count().catch((error) => {
      if (!isPrismaSchemaMismatchError(error)) throw error;
      return 0;
    }),
    prisma.user.count({
      where: { memberships: { some: { status: "ACTIVE" } } },
    }),
    prisma.attendanceSession.findMany({
      where: {
        date: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 60),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 14),
        },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        type: true,
        clubId: true,
        location: true,
        capacity: true,
        hostName: true,
        isOpen: true,
        date: true,
        records: {
          orderBy: [{ checkIn: "desc" }, { joinedAt: "desc" }],
          select: {
            id: true,
            status: true,
            present: true,
            joinedAt: true,
            checkIn: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                grade: true,
                graduationYear: true,
              },
            },
          },
        },
        _count: {
          select: {
            records: true,
          },
        },
      },
    }).catch((error) => {
      if (!isPrismaSchemaMismatchError(error)) throw error;
      return [];
    }),
  ]);

  return (
    <AdminClient
      clubs={clubs as any}
      users={users as any}
      applications={applications as any}
      changelog={changelog as any}
      flexSessions={flexSessions.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        clubId: item.clubId,
        location: item.location,
        capacity: item.capacity,
        attendeeCount: item._count.records,
        hostName: item.hostName,
        isOpen: item.isOpen,
        date: item.date.toISOString(),
        attendees: item.records.map((record) => ({
          id: record.id,
          status: record.status,
          present: record.present,
          joinedAt: record.joinedAt.toISOString(),
          checkIn: record.checkIn ? record.checkIn.toISOString() : null,
          user: record.user,
        })),
      })) as any}
      nhsRecords={nhsRecords}
      currentRole={session.user.role}
      analytics={{
        totalEvents,
        attendanceCount,
        participatingStudents,
        advisorClubIds,
      }}
    />
  );
}
