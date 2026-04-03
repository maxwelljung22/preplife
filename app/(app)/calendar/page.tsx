// app/(app)/calendar/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CalendarClient } from "./calendar-client";

export const metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 3, 0);

  const events = await prisma.event.findMany({
    where: { startTime: { gte: start, lte: end } },
    orderBy: { startTime: "asc" },
    include: {
      club: { select: { name: true, emoji: true, slug: true, gradientFrom: true, gradientTo: true } },
    },
  });

  // Also seed some sample events if none exist
  if (events.length === 0) {
    const clubs = await prisma.club.findMany({ where: { isActive: true }, take: 5 });
    if (clubs.length > 0) {
      await prisma.event.createMany({
        data: [
          { clubId: clubs[0]?.id, title: "Regular Meeting", location: clubs[0]?.meetingRoom ?? "Room TBD", type: "MEETING", startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 15, 15), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 16, 45) },
          { clubId: clubs[1]?.id, title: "Build Session", location: "Engineering Lab", type: "MEETING", startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 15, 15), endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 17, 30) },
          { clubId: null, title: "Activities Fair — Spring 2026", location: "McCarthy Hall", type: "SCHOOL_WIDE", isPublic: true, startTime: new Date(now.getFullYear(), now.getMonth() + 1, 4, 9, 0), endTime: new Date(now.getFullYear(), now.getMonth() + 1, 4, 12, 0) },
          { clubId: clubs[2]?.id, title: "Submission Deadline", location: "Online", type: "OTHER", startTime: new Date(now.getFullYear(), now.getMonth() + 1, 10, 23, 59), endTime: new Date(now.getFullYear(), now.getMonth() + 1, 10, 23, 59) },
        ],
        skipDuplicates: true,
      });
    }
  }

  const freshEvents = await prisma.event.findMany({
    where: { startTime: { gte: start, lte: end } },
    orderBy: { startTime: "asc" },
    include: { club: { select: { name: true, emoji: true, slug: true, gradientFrom: true, gradientTo: true } } },
  });

  return <CalendarClient events={freshEvents as any} />;
}
