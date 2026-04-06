import { Suspense } from "react";
import { DashboardClient } from "./dashboard-client";
import { getSession } from "@/lib/session";
import { getDashboardDataForUser } from "@/lib/dashboard-data";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user?.email) return null;

  const userId    = session.user.id;
  const userEmail = session.user.email;
  const userName  = session.user.name ?? null;
  const dashboardData = await getDashboardDataForUser({ userId, userEmail, userName });

  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-32 bg-muted rounded-2xl" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-28 bg-muted rounded-2xl" />)}</div></div>}>
      <DashboardClient
        user={session.user}
        membershipCount={dashboardData.membershipCount}
        upcomingEvents={dashboardData.upcomingEvents as any}
        recentPosts={dashboardData.recentPosts as any}
        myMemberships={dashboardData.myMemberships as any}
        nhsRecord={dashboardData.nhsRecord}
        unreadNotifs={dashboardData.unreadNotifs}
        notifications={dashboardData.notifications as any}
        workspaceTasks={dashboardData.workspaceTasks as any}
        assignmentDeadlines={dashboardData.assignmentDeadlines as any}
        applicationDeadlines={dashboardData.applicationDeadlines as any}
        pinnedPosts={dashboardData.pinnedPosts as any}
        importantResources={dashboardData.importantResources as any}
      />
    </Suspense>
  );
}
