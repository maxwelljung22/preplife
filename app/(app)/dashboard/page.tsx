import { Suspense } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getNhsRecordForUser } from "@/lib/airtable";
import { DashboardClient } from "./dashboard-client";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const userId    = session.user.id;
  const userEmail = session.user.email;
  const userName  = session.user.name ?? null;

  const [
    membershipCount,
    upcomingEvents,
    recentPosts,
    myMemberships,
    nhsRecord,
    unreadNotifs,
  ] = await Promise.all([
    prisma.membership.count({ where: { userId, status: "ACTIVE" } }),
    prisma.event.findMany({
      where: { startTime: { gte: new Date() } },
      orderBy: { startTime: "asc" },
      take: 5,
      include: { club: { select: { name: true, emoji: true, slug: true } } },
    }),
    prisma.post.findMany({
      where: { club: { memberships: { some: { userId, status: "ACTIVE" } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        club:   { select: { name: true, emoji: true, slug: true } },
        author: { select: { name: true, image: true } },
      },
    }),
    prisma.membership.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        club: {
          select: {
            id: true, name: true, emoji: true, slug: true,
            category: true, gradientFrom: true, gradientTo: true,
            meetingDay: true, meetingTime: true,
          },
        },
      },
    }),
    getNhsRecordForUser(userEmail, userName),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-2xl" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-28 bg-muted rounded-2xl" />)}</div></div>}>
      <DashboardClient
        user={session.user}
        membershipCount={membershipCount}
        upcomingEvents={upcomingEvents as any}
        recentPosts={recentPosts as any}
        myMemberships={myMemberships as any}
        nhsRecord={nhsRecord}
        unreadNotifs={unreadNotifs}
      />
    </Suspense>
  );
}
