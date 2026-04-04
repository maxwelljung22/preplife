import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FirstRunIntroGate } from "@/components/intro/first-run-intro-gate";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");
  const [introState, notifications, unreadNotifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasSeenIntro: true },
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        refId: true,
        refType: true,
        isRead: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
  ]);

  return (
    <FirstRunIntroGate userId={session.user.id} shouldShowInitially={!introState?.hasSeenIntro}>
      <AppShell user={session.user} notifications={notifications} unreadNotifications={unreadNotifications}>
        {children}
      </AppShell>
    </FirstRunIntroGate>
  );
}
