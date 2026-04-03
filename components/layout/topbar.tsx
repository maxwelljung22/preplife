"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Search, Bell, Sun, Moon, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandLogo } from "./brand-logo";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/clubs":         "Club Directory",
  "/calendar":      "Calendar",
  "/announcements": "Announcements",
  "/voting":        "Polls & Elections",
  "/applications":  "Applications",
  "/charter/apply": "New Charter",
  "/changelog":     "What's New",
  "/nhs":           "NHS Hours",
  "/admin":         "Admin Panel",
  "/admin/charters": "Charter Reviews",
  "/profile":       "Profile",
};

interface TopbarProps {
  user: { name?: string | null; image?: string | null; role: string };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    setNotifOpen(false);
  }, [pathname]);

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
        "sticky top-0 z-40 flex min-h-[72px] items-center justify-between px-6 lg:px-8 gap-4 topbar-glass border-b transition-all duration-200",
        scrolled ? "border-border shadow-[0_16px_40px_rgba(15,23,42,0.08)]" : "border-transparent"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">PrepLife Workspace</p>
        <h1 className="mt-1 truncate text-[20px] font-semibold tracking-[-0.04em] text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden 2xl:block mr-2 opacity-90">
          <BrandLogo compact className="scale-[0.92]" />
        </div>
        {/* Search */}
        <div className="hidden xl:flex items-center gap-2 h-11 px-4 bg-card/90 border border-border/70 rounded-2xl focus-within:bg-background focus-within:border-border focus-within:shadow-glow-crimson transition-all duration-150 w-72 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Search clubs, events…"
            className="flex-1 min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-11 w-11 rounded-2xl border border-border/70 bg-card/90 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 hover:shadow-card"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative h-11 w-11 rounded-2xl border border-border/70 bg-card/90 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
            aria-label="Open notifications"
            aria-expanded={notifOpen}
            aria-haspopup="dialog"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-crimson ring-2 ring-card" style={{ background: "#8B1A1A" }} />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-card border border-border rounded-3xl shadow-modal overflow-hidden z-50 animate-fade-up origin-top-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-[13px] font-bold text-foreground">Notifications</p>
              <span className="text-[11px] text-muted-foreground">Inbox</span>
            </div>
            <div className="px-5 py-8 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(139,26,26,.08)] text-[rgb(139,26,26)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">Everything is quiet</p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">New updates and alerts will appear here.</p>
            </div>
            <div className="px-4 py-3 text-center border-t border-border">
              <Link href="/changelog" onClick={() => setNotifOpen(false)} className="text-[12.5px] font-medium" style={{ color: "#8B1A1A" }}>
                View all updates →
              </Link>
            </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link href="/profile" aria-label="Open profile">
          <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-crimson/30 transition-all shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-white text-[11px] font-bold" style={{ background: "linear-gradient(135deg, #B8952E, #A31212)" }}>
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
