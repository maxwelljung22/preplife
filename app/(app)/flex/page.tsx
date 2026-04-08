import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FlexBrowser } from "@/components/attendance/flex-browser";
import { AttendanceSetupNotice } from "@/components/attendance/attendance-setup-notice";
import { getFlexBlockWindow } from "@/lib/flex-attendance";
import { isPrismaMissingColumnError } from "@/lib/prisma-errors";

export const metadata = { title: "Flex Block" };
export const dynamic = "force-dynamic";

function parseSelectedDate(value?: string) {
  if (!value) return getFlexBlockWindow().date;
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return getFlexBlockWindow().date;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export default async function FlexPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const params = (await searchParams) ?? {};
  const selectedDate = parseSelectedDate(params.date);
  const selectedDateValue = selectedDate.toISOString().slice(0, 10);
  const { dayStart, dayEnd } = getFlexBlockWindow(selectedDate);
  const todayStart = getFlexBlockWindow().dayStart;
  const browserStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate());
  const browserEnd = new Date(browserStart.getFullYear(), browserStart.getMonth(), browserStart.getDate() + 21);

  try {
    const [sessions, joinedRecord, availableDates] = await Promise.all([
      prisma.attendanceSession.findMany({
        where: {
          date: {
            gte: dayStart,
            lt: dayEnd,
          },
          isOpen: true,
        },
        orderBy: [{ type: "asc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
          capacity: true,
          hostName: true,
          clubId: true,
          _count: {
            select: {
              records: true,
            },
          },
        },
      }),
      prisma.attendanceRecord.findFirst({
        where: {
          userId: session.user.id,
          session: {
            date: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
        select: {
          sessionId: true,
          status: true,
        },
      }),
      prisma.attendanceSession.findMany({
        where: {
          date: {
            gte: browserStart,
            lt: browserEnd,
          },
          isOpen: true,
        },
        orderBy: { date: "asc" },
        select: {
          date: true,
        },
      }),
    ]);

    return (
      <FlexBrowser
        sessions={sessions.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          location: item.location,
          capacity: item.capacity,
          attendeeCount: item._count.records,
          hostName: item.hostName,
          clubId: item.clubId,
        }))}
        selectedDate={selectedDateValue}
        availableDates={Array.from(new Set(availableDates.map((item) => item.date.toISOString().slice(0, 10))))}
        joinedSessionId={joinedRecord?.sessionId ?? null}
        joinedStatus={joinedRecord?.status ?? null}
      />
    );
  } catch (error) {
    if (isPrismaMissingColumnError(error, "Attendance")) {
      return (
        <AttendanceSetupNotice
          title="Flex attendance needs the latest schema"
          description="The flex experience is unlocked, but this deployment still needs the attendance migration before students can browse and join sessions."
        />
      );
    }

    throw error;
  }
}
