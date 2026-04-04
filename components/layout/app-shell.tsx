"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sidebar, type ShellUser } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

type ShellNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string | Date;
  type: string;
  refId?: string | null;
  refType?: string | null;
  isRead: boolean;
};

export function AppShell({
  user,
  notifications,
  unreadNotifications,
  children,
}: {
  user: ShellUser["user"];
  notifications: ShellNotification[];
  unreadNotifications: number;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("hawklife:sidebar-open");
    if (stored !== null) {
      setSidebarOpen(stored === "true");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("hawklife:sidebar-open", String(sidebarOpen));
  }, [hydrated, sidebarOpen]);

  return (
    <div className="app-shell-bg flex min-h-screen bg-background">
      <Sidebar user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={cn("flex min-w-0 flex-1 flex-col transition-[margin] duration-300", sidebarOpen ? "lg:ml-[288px]" : "lg:ml-0")}>
        <Topbar
          user={user}
          onToggleSidebar={() => setSidebarOpen((value) => !value)}
          notifications={notifications}
          unreadNotifications={unreadNotifications}
        />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
