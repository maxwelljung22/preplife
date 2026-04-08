import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin, canAccessFacultyTools } from "@/lib/roles";
import { FacultySessionManager } from "@/components/attendance/faculty-session-manager";
import { AttendanceSetupNotice } from "@/components/attendance/attendance-setup-notice";
import { canParticipateInFlex, getFlexBlockWindow } from "@/lib/flex-attendance";
import { isPrismaMissingColumnError, isPrismaSchemaMismatchError } from "@/lib/prisma-errors";

export const metadata = { title: "Create Session" };
export const dynamic = "force-dynamic";

export default async function FacultyCreateSessionPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");
  if (!canAccessFacultyTools(session.user.role)) redirect("/dashboard");
  const isAdmin = canAccessAdmin(session.user.role);

  const { date } = getFlexBlockWindow();
  const advisedClubIds = !isAdmin
    ? (
        await prisma.membership.findMany({
          where: {
            userId: session.user.id,
            status: "ACTIVE",
            role: "FACULTY_ADVISOR",
          },
          select: { clubId: true },
        })
      ).map((membership) => membership.clubId)
    : [];

  try {
    const [clubs, students, sessions, savedGroups] = await Promise.all([
      prisma.club.findMany({
        where: isAdmin ? { isActive: true } : { isActive: true, id: { in: advisedClubIds } },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          meetingRoom: true,
        },
      }),
      prisma.user.findMany({
        orderBy: [{ name: "asc" }, { email: "asc" }],
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          grade: true,
          graduationYear: true,
        },
      }),
      prisma.attendanceSession.findMany({
        where: isAdmin
          ? {
              date: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 60),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 60),
              },
            }
          : {
              date: {
                gte: new Date(date.getFullYear(), date.getMonth(), date.getDate() - 60),
                lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 60),
              },
              OR: [{ clubId: null, createdById: session.user.id }, { clubId: { in: advisedClubIds } }],
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
      }),
      prisma.flexSelectionGroup.findMany({
        where: { ownerId: session.user.id },
        orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          studentIds: true,
          updatedAt: true,
        },
      }).catch((error) => {
        if (!isPrismaSchemaMismatchError(error)) throw error;
        return [];
      }),
    ]);

    return (
      <FacultySessionManager
        clubs={clubs}
        students={students.filter(canParticipateInFlex)}
        savedGroups={savedGroups}
        currentRole={session.user.role}
        sessions={sessions.map((item) => ({
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
        }))}
      />
    );
  } catch (error) {
    if (isPrismaMissingColumnError(error, "Attendance")) {
      return (
        <AttendanceSetupNotice
          title="Faculty session tools need the latest schema"
          description="Session creation is unlocked, but this deployment still needs the attendance migration before faculty can create and manage live flex sessions."
        />
      );
    }

    throw error;
  }
}
