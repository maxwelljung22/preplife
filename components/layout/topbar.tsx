"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Search, Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/clubs":         "Club Directory",
  "/calendar":      "Calendar",
  "/announcements": "Announcements",
  "/voting":        "Polls & Elections",
  "/applications":  "Applications",
  "/changelog":     "What's New",
  "/nhs":           "NHS Hours",
  "/admin":         "Admin Panel",
  "/profile":       "Profile",
};

interface TopbarProps {
  user: { name?: string | null; image?: string | null; role: string };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [notifOpen]);

  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ??
    "PrepLife";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-[54px] flex items-center px-6 lg:px-8 gap-3 topbar-glass border-b transition-shadow duration-200",
        scrolled ? "shadow-sm border-border" : "border-transparent"
      )}
    >
      <h1 className="flex-1 text-[15px] font-semibold text-foreground truncate" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h1>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 h-9 px-3 bg-muted border border-transparent rounded-[10px] focus-within:bg-background focus-within:border-border focus-within:shadow-glow-crimson transition-all duration-150 w-56 focus-within:w-72">
        <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <input
          placeholder="Search clubs, events…"
          className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-9 w-9 rounded-[10px] border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 hover:shadow-card"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="relative h-9 w-9 rounded-[10px] border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-crimson ring-2 ring-card" style={{ background: "#8B1A1A" }} />
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-[calc(100%+10px)] w-80 bg-card border border-border rounded-2xl shadow-modal overflow-hidden z-50 animate-fade-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-[13px] font-bold text-foreground">Notifications</p>
              <button className="text-[11.5px] font-medium" style={{ color: "#8B1A1A" }}>
                Mark all read
              </button>
            </div>
            {[
              { icon: "🌐", title: "MUN: HMUN Registration Open", sub: "Deadline Nov 1", when: "2h ago", unread: true },
              { icon: "📈", title: "Investment Club: Q3 Review", sub: "Thursday 3:15 PM", when: "5h ago", unread: true },
              { icon: "✦",  title: "PrepLife V3 Launched",       sub: "NHS, dark mode, workspaces", when: "Yesterday", unread: false },
            ].map((n, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors",
                  n.unread && "bg-crimson/[0.04]"
                )}
              >
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-base flex-shrink-0">{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground leading-snug">{n.title}</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{n.sub}</p>
                  <p className="text-[10.5px] text-muted-foreground/70 mt-1">{n.when}</p>
                </div>
                {n.unread && <div className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" style={{ background: "#8B1A1A" }} />}
              </div>
            ))}
            <div className="px-4 py-3 text-center">
              <Link href="/changelog" onClick={() => setNotifOpen(false)} className="text-[12.5px] font-medium" style={{ color: "#8B1A1A" }}>
                View all updates →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <Link href="/profile">
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-crimson/30 transition-all">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-white text-[11px] font-bold" style={{ background: "linear-gradient(135deg, #B8952E, #A31212)" }}>
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
