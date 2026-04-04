import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FirstRunIntroGate } from "@/components/intro/first-run-intro-gate";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");
  const introState = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hasSeenIntro: true },
  });

  return (
    <FirstRunIntroGate userId={session.user.id} shouldShowInitially={!introState?.hasSeenIntro}>
      <div className="app-shell-bg flex min-h-screen bg-background">
        <Sidebar user={session.user} />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-[288px]">
          <Topbar user={session.user} />
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
            {children}
          </main>
        </div>
      </div>
    </FirstRunIntroGate>
  );
}
