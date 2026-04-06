import { SettingsClient } from "./settings-client";
import { getSession } from "@/lib/session";
import { getDashboardDataForUser } from "@/lib/dashboard-data";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.email) return null;

  const dashboardData = await getDashboardDataForUser({
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name ?? null,
  });

  return (
    <SettingsClient
      dashboardData={{
        userId: session.user.id,
        membershipCount: dashboardData.membershipCount,
        unreadNotifs: dashboardData.unreadNotifs,
        upcomingEvents: dashboardData.upcomingEvents,
        recentPosts: dashboardData.recentPosts,
        myMemberships: dashboardData.myMemberships,
        workspaceTasks: dashboardData.workspaceTasks,
        notifications: dashboardData.notifications,
        assignmentDeadlines: dashboardData.assignmentDeadlines,
        applicationDeadlines: dashboardData.applicationDeadlines,
        pinnedPosts: dashboardData.pinnedPosts,
        importantResources: dashboardData.importantResources,
      }}
    />
  );
}
