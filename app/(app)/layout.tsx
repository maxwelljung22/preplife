import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="app-shell-bg flex min-h-screen bg-background">
      <Sidebar user={session.user} />
      <div className="flex-1 flex flex-col ml-[288px] min-w-0">
        <Topbar user={session.user} />
        <main className="flex-1 w-full max-w-[1520px] mx-auto px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
