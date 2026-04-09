import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Compass, FileText, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessFacultyTools, canAccessMissionMinistry } from "@/lib/roles";
import { isPrismaSchemaMismatchError } from "@/lib/prisma-errors";

export const metadata = { title: "Faculty Dashboard" };
export const dynamic = "force-dynamic";

async function getAdvisedClubs(userId: string) {
  const select = {
    id: true,
    slug: true,
    name: true,
    emoji: true,
    tagline: true,
    logoUrl: true,
    meetingDay: true,
    meetingTime: true,
    meetingRoom: true,
    _count: {
      select: {
        memberships: { where: { status: "ACTIVE" } },
        applications: true,
      },
    },
  } as const;

  try {
    return await prisma.club.findMany({
      where: {
        isActive: true,
        memberships: {
          some: {
            userId,
            status: "ACTIVE",
            role: "FACULTY_ADVISOR",
          },
        },
      },
      orderBy: { name: "asc" },
      select,
    });
  } catch (error) {
    if (!isPrismaSchemaMismatchError(error)) throw error;

    return (
      await prisma.club.findMany({
        where: {
          isActive: true,
          memberships: {
            some: {
              userId,
              status: "ACTIVE",
              role: "FACULTY_ADVISOR",
            },
          },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          emoji: true,
          tagline: true,
          meetingDay: true,
          meetingTime: true,
          meetingRoom: true,
          _count: {
            select: {
              memberships: { where: { status: "ACTIVE" } },
              applications: true,
            },
          },
        },
      })
    ).map((club) => ({ ...club, logoUrl: null }));
  }
}

export default async function FacultyDashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");
  if (!canAccessFacultyTools(session.user.role)) redirect("/dashboard?error=unauthorized");

  const [advisedClubs, openApplications, flexSessionsToday] = await Promise.all([
    getAdvisedClubs(session.user.id),
    prisma.application.count({
      where: {
        status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
        club: {
          memberships: {
            some: {
              userId: session.user.id,
              status: "ACTIVE",
              role: "FACULTY_ADVISOR",
            },
          },
        },
      },
    }),
    prisma.attendanceSession.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    }).catch((error) => {
      if (!isPrismaSchemaMismatchError(error)) throw error;
      return 0;
    }),
  ]);
  const canManageMinistry = canAccessMissionMinistry(session.user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-crimson/10 text-crimson">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[.09em] text-crimson">Faculty Controls</p>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-foreground">Faculty Dashboard</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Advised Clubs", value: advisedClubs.length, icon: Compass },
          { label: "Open Applications", value: openApplications, icon: FileText },
          { label: "Flex Sessions Today", value: flexSessionsToday, icon: CalendarDays },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))]">
              <Icon className="h-4 w-4" />
            </div>
            <p className="font-display text-[30px] font-semibold leading-none text-foreground">{value}</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">Your clubs</p>
            <h2 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.05em] text-foreground">Manage the clubs you advise</h2>
          </div>
          <Link
            href="/faculty/create-session"
            className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            Open session tools
          </Link>
        </div>

        {advisedClubs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-background/60 px-5 py-8 text-center">
            <p className="text-[15px] font-semibold text-foreground">No advised clubs found yet.</p>
            <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
              Once you are listed as a faculty advisor on a club, it will appear here with quick management links.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {advisedClubs.map((club) => (
              <div key={club.id} className="rounded-[1.6rem] border border-border/80 bg-background/70 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-muted text-2xl">
                    {club.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={club.logoUrl} alt={`${club.name} logo`} className="h-full w-full object-cover" />
                    ) : (
                      <span>{club.emoji}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1.05rem] font-semibold text-foreground">{club.name}</p>
                    <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{club.tagline || "Manage members, applications, and club activity."}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-muted px-3.5 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Members</p>
                    <p className="mt-1 text-[18px] font-semibold text-foreground">{club._count.memberships}</p>
                  </div>
                  <div className="rounded-xl bg-muted px-3.5 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Applications</p>
                    <p className="mt-1 text-[18px] font-semibold text-foreground">{club._count.applications}</p>
                  </div>
                  <div className="rounded-xl bg-muted px-3.5 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Meeting</p>
                    <p className="mt-1 text-[14px] font-semibold text-foreground">{club.meetingDay || "TBA"}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5 text-[13px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {club.meetingTime || "Time TBD"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {club.meetingRoom || "Room TBD"}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/clubs/${club.slug}`}
                    className="inline-flex items-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    Open club
                  </Link>
                  <Link
                    href={`/clubs/${club.slug}/workspace`}
                    className="inline-flex items-center rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Open workspace
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canManageMinistry ? (
        <div className="rounded-[2rem] border border-border bg-[linear-gradient(145deg,rgba(139,26,26,0.12),rgba(217,119,6,0.1),rgba(14,165,233,0.08))] p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-[hsl(var(--primary))] shadow-sm">
                <Heart className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">Mission & Ministry</p>
              <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.05em] text-foreground">Publish service, Kairos, and retreat programs</h2>
              <p className="mt-2 text-[14px] leading-7 text-muted-foreground">
                Mission & Ministry publishing now lives in its own staff workspace, separate from the student page, so it stays cleaner and easier to manage.
              </p>
            </div>

            <Link
              href="/faculty/mission-ministry"
              className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Open Mission & Ministry tools
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
