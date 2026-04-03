"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Calendar, Megaphone,
  Vote, FileText, Scroll, ShieldCheck, GraduationCap, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn, initials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  label:  string;
  href:   string;
  icon:   React.ReactNode;
  badge?: number;
  isNew?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",     icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Clubs",         href: "/clubs",         icon: <Users           className="h-4 w-4" /> },
  { label: "Calendar",      href: "/calendar",      icon: <Calendar        className="h-4 w-4" /> },
  { label: "Announcements", href: "/announcements", icon: <Megaphone       className="h-4 w-4" /> },
  { label: "Voting",        href: "/voting",         icon: <Vote            className="h-4 w-4" /> },
  { label: "Applications",  href: "/applications",  icon: <FileText        className="h-4 w-4" /> },
  { label: "What's New",    href: "/changelog",     icon: <Scroll          className="h-4 w-4" />, isNew: true },
  { label: "NHS Hours",     href: "/nhs",           icon: <GraduationCap   className="h-4 w-4" /> },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Admin Panel", href: "/admin", icon: <ShieldCheck className="h-4 w-4" /> },
];

interface SidebarProps {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null; role: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 sidebar-bg flex flex-col border-r border-white/5">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 140% 50% at 70% -10%, rgba(139,26,26,.16) 0%, transparent 60%)," +
            "radial-gradient(ellipse 60% 30% at 10% 100%, rgba(154,124,46,.07) 0%, transparent 50%)",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 px-5 py-5 border-b border-white/6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
            style={{ background: "#8B1A1A", boxShadow: "0 4px 12px rgba(139,26,26,.4)" }}
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M2 4h12M4 8h8M6 12h4" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-bold text-white tracking-tight leading-none" style={{ fontFamily: "var(--font-display)" }}>
              PrepLife
            </p>
            <p className="text-[10px] text-white/30 mt-0.5 tracking-wide">St. Joseph&apos;s Prep</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        <p className="text-[9.5px] font-bold tracking-[0.10em] uppercase text-white/22 px-2 mb-1.5 mt-2">
          Student Hub
        </p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-2.5 px-2 py-2 rounded-[9px] text-[13.5px] font-[450] transition-all duration-150",
              isActive(item.href)
                ? "bg-white/10 text-white"
                : "text-white/48 hover:bg-white/7 hover:text-white/85"
            )}
          >
            <span className={cn("opacity-60", isActive(item.href) && "opacity-100")}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.isNew && (
              <span className="text-[9px] font-bold uppercase tracking-wide bg-crimson-700/80 text-white px-1.5 py-0.5 rounded-full" style={{ background: "rgba(139,26,26,.8)" }}>
                New
              </span>
            )}
          </Link>
        ))}

        {user.role === "ADMIN" && (
          <>
            <p className="text-[9.5px] font-bold tracking-[0.10em] uppercase text-white/22 px-2 mb-1.5 mt-4">
              Administration
            </p>
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-2 rounded-[9px] text-[13.5px] font-[450] transition-all duration-150",
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/48 hover:bg-white/7 hover:text-white/85"
                )}
              >
                <span className={cn("opacity-60", isActive(item.href) && "opacity-100")}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="relative z-10 px-3 py-3 border-t border-white/6">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-[9px] hover:bg-white/7 transition-colors cursor-pointer group">
          <Avatar className="h-[30px] w-[30px] flex-shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #B8952E, #A31212)" }}>
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate leading-none">{user.name}</p>
            <p className="text-[10px] text-white/32 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5 text-white/40 hover:text-white/80 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
}
