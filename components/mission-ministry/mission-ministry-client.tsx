"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Heart, MapPin, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  deleteMinistryProgram,
  toggleMinistryProgramRegistration,
  toggleMinistrySignup,
} from "@/app/(app)/mission-ministry/actions";
import type { ServiceOpportunityEvent } from "@/lib/signup-genius";
import { cn } from "@/lib/utils";

type ProgramType = "SERVICE_OPPORTUNITY" | "KAIROS" | "RETREAT";

type ProgramItem = {
  id: string;
  title: string;
  summary: string;
  description: string;
  type: ProgramType;
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string | null;
  capacity: number | null;
  isFeatured: boolean;
  registrationOpen: boolean;
  colorFrom: string;
  colorTo: string;
  imageUrl: string | null;
  createdByName: string | null;
  signupCount: number;
  signedUp: boolean;
  signups: {
    id: string;
    name: string | null;
    email: string | null;
    graduationYear: number | null;
  }[];
};

const TYPE_META: Record<ProgramType, { label: string; description: string; accent: string }> = {
  SERVICE_OPPORTUNITY: {
    label: "Service Opportunities",
    description: "Find service projects, local outreach, and ways to serve with intention.",
    accent: "from-[rgba(14,165,233,0.18)] to-[rgba(20,184,166,0.1)]",
  },
  KAIROS: {
    label: "Kairos",
    description: "Track Kairos offerings, key dates, and sign-up windows in one place.",
    accent: "from-[rgba(139,92,246,0.16)] to-[rgba(236,72,153,0.1)]",
  },
  RETREAT: {
    label: "Retreats",
    description: "See upcoming retreats, spiritual formation experiences, and registration info.",
    accent: "from-[rgba(245,158,11,0.18)] to-[rgba(239,68,68,0.1)]",
  },
};

const PROGRAM_TYPES = Object.keys(TYPE_META) as ProgramType[];
const SERVICE_SIGNUP_GENIUS_URL = "https://www.signupgenius.com/go/10C0F44AAA62AA1FFC07-service#/";
const PAGE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "service", label: "Service Opportunities" },
  { id: "kairos", label: "Kairos" },
  { id: "retreat", label: "Retreats" },
] as const;
type PageTab = (typeof PAGE_TABS)[number]["id"];

const RECURRING_SERVICE_OPPORTUNITIES = [
  {
    title: "PAR Recycle Works Collection Events",
    body:
      "PAR Recycle Works collects e-waste to be processed and recycled. Students are needed at collection drives throughout Philadelphia and the surrounding areas. Email Ms. Longto at klongto@sjprep.org for details or to sign up. These events are not typically staffed by Prep chaperones.",
  },
  {
    title: "Sharing Excess Events",
    body:
      "The Prep recently formed an on-campus chapter with Sharing Excess, a Philly nonprofit that rescues food before it is thrown away and distributes it to people who can use it. Beyond recurring after-school First Friday Pop Up Food distribution events on campus, there are several ways to partner with Sharing Excess.",
  },
  {
    title: "SSJ Neighborhood Center Food Pantry Days",
    body:
      "On the third Wednesday of every month, students assist the Sisters of St. Joseph as they prepare for their monthly food pantry day serving more than 200 families in the Cramer Park neighborhood of Camden. Service runs from the beginning of the school day until 2:00 PM. Students may miss class and volunteer once each school year if they are in good academic standing. During the summer months, service runs from 9:00 AM to 2:00 PM.",
  },
  {
    title: "Share Food Program - Nice Roots Farm",
    body:
      "Share Food Program leads the fight against food insecurity in the Philadelphia region through a broad network of community partners and school districts. Community Farming Days at Nice Roots Farm help students learn about growing food in an urban environment, make an impact with hands-on work, and meet others doing the same. No green thumb necessary.",
  },
  {
    title: "Gesu School Tutoring",
    body:
      "Every Tuesday and Thursday during Community Period. Please sign up through Flex Time Manager.",
  },
];

const PRE_APPROVED_SITES = [
  {
    region: "Philadelphia",
    sites: [
      "Sanctuary Farm",
      "Face to Face Germantown",
      "Share Food Programs",
      "Nationalities Service Center",
      "Caring for Friends",
      "Inglis House",
      "Northern Children's Services",
      "Philabundance",
      "MANNA",
      "Feast of Justice",
      "Blessed Sarnelli House",
      "Cradles to Crayons",
      "Friends of the Wissahickon",
    ],
  },
  {
    region: "Delaware County, PA",
    sites: [
      "Grands Stepping Up: Denis' Pantry",
      "Divine Providence Village",
      "Kids Against Hunger, Broomall, PA",
      "Media Food Bank",
    ],
  },
  {
    region: "Montgomery County, PA",
    sites: [
      "Martha's Choice Community Farm",
      "Martha's Choice Food Pantry",
      "Narberth Community Food Bank",
      "Mitzvah Circle",
      "The Shepherd's Shelf",
      "Manna on Main Street",
      "Cecil and Grace Bean's Soup Kitchen",
    ],
  },
  {
    region: "South Jersey",
    sites: ["Cathedral Kitchen", "South Jersey Food Bank", "Joseph's House", "SSJ Neighborhood Center"],
  },
  {
    region: "Chester County, PA",
    sites: ["Dorothy Day Center, West Chester, PA"],
  },
];

const SERVICE_HOUR_REQUIREMENTS = [
  "Freshmen are required to complete 10 hours.",
  "Sophomores are required to complete 10 hours.",
  "Juniors are required to complete 20 hours of service.",
  "Seniors are required to complete 40 hours of service.",
  "All students are required to have 80 hours completed at the time of graduation, with 75 hours for the Class of 2025 and Class of 2026.",
];

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return `${start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · ${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function formatEventCardDate(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · ${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  return `${start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} - ${end.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}`;
}

export function MissionMinistryClient({
  programs,
  managerNames,
  canManage,
  serviceEvents,
}: {
  programs: ProgramItem[];
  managerNames: string[];
  canManage: boolean;
  serviceEvents: ServiceOpportunityEvent[];
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<PageTab>("overview");

  const groupedPrograms = useMemo(
    () =>
      PROGRAM_TYPES.map((type) => ({
        type,
        meta: TYPE_META[type],
        items: programs.filter((program) => program.type === type),
      })),
    [programs]
  );
  const featuredPrograms = programs.filter((program) => program.isFeatured);
  const kairosPrograms = groupedPrograms.find((section) => section.type === "KAIROS")?.items ?? [];
  const retreatPrograms = groupedPrograms.find((section) => section.type === "RETREAT")?.items ?? [];

  const handleSignup = (programId: string) => {
    startTransition(async () => {
      const result = await toggleMinistrySignup(programId);
      if ("error" in result) {
        toast({ title: "Couldn't update signup", description: result.error, variant: "destructive" });
        return;
      }

      toast({
        title: result.action === "added" ? "You’re signed up" : "Signup removed",
        description: result.title,
      });
    });
  };

  const handleToggleOpen = (programId: string, nextOpen: boolean) => {
    startTransition(async () => {
      const result = await toggleMinistryProgramRegistration(programId, nextOpen);
      if ("error" in result) {
        toast({ title: "Couldn't update registration", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: nextOpen ? "Registration reopened" : "Registration closed" });
    });
  };

  const handleDelete = (programId: string) => {
    startTransition(async () => {
      const result = await deleteMinistryProgram(programId);
      if ("error" in result) {
        toast({ title: "Couldn't delete program", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: "Program removed" });
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-[38px] border border-border bg-[linear-gradient(135deg,rgba(139,26,26,0.16),rgba(217,119,6,0.16),rgba(14,165,233,0.14),rgba(20,184,166,0.1))] p-6 shadow-[0_26px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_26%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">School Life</p>
            <h1 className="mt-3 text-balance text-[clamp(2.5rem,7vw,4.8rem)] font-semibold tracking-[-0.07em] text-foreground">
              Mission & Ministry
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              A brighter home for service opportunities, Kairos updates, and retreat sign-ups across the Prep.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PAGE_TABS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                    tab === item.id
                      ? "border-transparent bg-white text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.1)]"
                      : "border-white/40 bg-white/40 text-muted-foreground hover:bg-white/60 hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {managerNames.length > 0 ? (
                managerNames.map((name) => (
                  <span key={name} className="rounded-full border border-border bg-white/75 px-3 py-1.5 text-[12px] font-medium text-foreground">
                    {name}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-border bg-white/75 px-3 py-1.5 text-[12px] font-medium text-foreground">
                  Ministry team updates coming soon
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Featured", value: featuredPrograms.length },
              { label: "Open sign-ups", value: programs.filter((program) => program.registrationOpen).length },
              { label: "Total programs", value: programs.length },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-border bg-white/75 px-4 py-4 backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {canManage ? (
        <div className="flex justify-end">
          <Link
            href="/faculty/mission-ministry"
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Open staff publishing tools
          </Link>
        </div>
      ) : null}

      {tab === "overview" ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Heart,
            title: "Rooted in service",
            body: "Keep students connected to meaningful service and ministry opportunities with one calm, consistent home.",
          },
          {
            icon: CalendarDays,
            title: "Kairos & retreat planning",
            body: "Make big milestones easier to discover, easier to register for, and easier to track.",
          },
          {
            icon: Users,
            title: "Clear team presence",
            body: "Let students see who leads Mission & Ministry and where to go when they need the next step.",
          },
        ].map((item) => (
          <div key={item.title} className="surface-card rounded-[28px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(139,26,26,0.08)] text-[hsl(var(--primary))]">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.05em] text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-card rounded-[32px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Featured right now</p>
          <div className="mt-5 grid gap-4">
            {(featuredPrograms.length > 0 ? featuredPrograms : serviceEvents.slice(0, 2).map((event) => ({
              id: event.id,
              title: event.title,
              summary: event.description,
              description: event.description,
              type: "SERVICE_OPPORTUNITY" as ProgramType,
              location: event.location,
              startDate: event.startDate,
              endDate: event.endDate,
              registrationDeadline: null,
              capacity: event.seatsTotal,
              isFeatured: true,
              registrationOpen: !event.isFull,
              colorFrom: "#8B1A1A",
              colorTo: "#0EA5E9",
              imageUrl: null,
              createdByName: "Mission & Ministry",
              signupCount: event.seatsTaken,
              signedUp: false,
              signups: [],
            }))).slice(0, 2).map((program, index) => {
                const capacityReached = program.capacity !== null && program.signupCount >= program.capacity && !program.signedUp;
                return (
                  <motion.article
                    key={program.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.03 }}
                    className="overflow-hidden rounded-[30px] border border-border bg-card shadow-card"
                  >
                    <div className={cn("p-5 sm:p-6", "bg-gradient-to-br", TYPE_META[program.type].accent)} style={{ backgroundImage: `linear-gradient(135deg, ${program.colorFrom}20, ${program.colorTo}18)` }}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            {program.isFeatured ? (
                              <span className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                                Featured
                              </span>
                            ) : null}
                            <span className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                              {TYPE_META[program.type].label}
                            </span>
                          </div>
                          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">{program.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{program.summary}</p>
                        </div>
                        <div className="rounded-[22px] border border-white/40 bg-white/70 px-4 py-3 text-sm text-foreground shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sign-ups</p>
                          <p className="mt-1 text-xl font-semibold">{program.signupCount}{program.capacity ? `/${program.capacity}` : ""}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-5 sm:p-6">
                      <p className="text-sm leading-7 text-muted-foreground">{program.description}</p>

                      <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateRange(program.startDate, program.endDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {program.location}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[12px] text-muted-foreground">
                        <span className="rounded-full border border-border bg-muted px-3 py-1.5">
                          {program.registrationOpen ? "Registration open" : "Registration closed"}
                        </span>
                        {program.registrationDeadline ? (
                          <span className="rounded-full border border-border bg-muted px-3 py-1.5">
                            Deadline {new Date(program.registrationDeadline).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-border bg-muted px-3 py-1.5">
                          Posted by {program.createdByName || "Mission & Ministry"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          size="lg"
                          onClick={() => handleSignup(program.id)}
                          disabled={isPending || (!program.registrationOpen && !program.signedUp) || capacityReached}
                          className={cn(
                            "w-full sm:w-auto",
                            program.signedUp ? "" : ""
                          )}
                        >
                          {program.signedUp ? "Cancel sign-up" : capacityReached ? "Program full" : "Sign up"}
                        </Button>

                        {canManage ? (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" size="sm" onClick={() => handleToggleOpen(program.id, !program.registrationOpen)} disabled={isPending}>
                              {program.registrationOpen ? "Close registration" : "Reopen registration"}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(program.id)} disabled={isPending}>
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      {canManage && program.signups.length > 0 ? (
                        <div className="rounded-[24px] border border-border bg-muted/35 p-4">
                          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Student roster</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {program.signups.map((signup) => (
                              <span key={signup.id} className="rounded-full border border-border bg-background px-3 py-1.5 text-[12px] text-foreground">
                                {signup.name || signup.email || "Student"}{signup.graduationYear ? ` · ${signup.graduationYear}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </motion.article>
                );
              })}
          </div>
        </section>

        <section className="surface-card rounded-[32px] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">What students can do here</p>
          <div className="mt-4 space-y-4">
            {[
              "Browse live service opportunities without leaving HawkLife.",
              "Track Kairos offerings and sign up windows in one place.",
              "See upcoming retreats with cleaner details and registration status.",
              "Open the full Mission & Ministry signup tools from the faculty dashboard if you manage the department.",
            ].map((item) => (
              <div key={item} className="rounded-[22px] border border-border bg-muted/35 px-4 py-3 text-sm leading-7 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
        </>
      ) : null}

      {tab === "service" ? (
        <div className="space-y-4">
          <section className="surface-card overflow-hidden rounded-[34px] p-6 sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live Service Calendar</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-foreground">Upcoming service opportunities pulled from SignUpGenius</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                  A brighter, roomier view of what is coming up next. The cards auto-glide on larger screens and still scroll manually on phones.
                </p>
              </div>
              <Link
                href={SERVICE_SIGNUP_GENIUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Open live signup
              </Link>
            </div>

            <div className="mt-6 overflow-hidden">
              {serviceEvents.length > 0 ? (
                <motion.div
                  className="flex w-max gap-4 pr-4"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 36, ease: "linear", repeat: Infinity }}
                >
                  {[...serviceEvents, ...serviceEvents].map((event, index) => (
                    <article
                      key={`${event.id}-${index}`}
                      className="w-[min(84vw,360px)] rounded-[30px] border border-border bg-[linear-gradient(145deg,rgba(139,26,26,0.14),rgba(217,119,6,0.14),rgba(14,165,233,0.12))] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            {event.isFull ? "Currently full" : "Open opportunity"}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold tracking-[-0.05em] text-foreground">{event.title}</h3>
                        </div>
                        <div className="rounded-full border border-white/50 bg-white/80 px-3 py-1 text-[11px] font-semibold text-foreground">
                          {event.seatsTaken}/{event.seatsTotal || "?"}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{formatEventCardDate(event.startDate, event.endDate)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <p className="mt-4 min-h-[96px] text-sm leading-6 text-muted-foreground">{event.description}</p>

                      <Link
                        href={event.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center justify-center rounded-2xl border border-border bg-white/80 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white"
                      >
                        Sign up in SignUpGenius
                      </Link>
                    </article>
                  ))}
                </motion.div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                  The live service feed is temporarily unavailable. You can still use the SignUpGenius button above.
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
            <section className="surface-card rounded-[32px] p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recurring Opportunities</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">Service opportunities that come around often</h3>
                </div>
                <Link
                  href={SERVICE_SIGNUP_GENIUS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                >
                  Open SignUpGenius
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {RECURRING_SERVICE_OPPORTUNITIES.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.04 }}
                    className="rounded-[24px] border border-border bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(255,255,255,0.44))] p-4"
                  >
                    <h4 className="text-[1.05rem] font-semibold tracking-[-0.04em] text-foreground">{item.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="space-y-4">
              <section className="surface-card rounded-[32px] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Pre-Approved Sites</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">A strong starting point for service</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Hours at these sites are pre-approved for service hours. Please contact Ms. Longto for more information about any of these locations. This list is not exhaustive, but it is a strong place to begin.
                </p>
                <div className="mt-5 grid gap-4">
                  {PRE_APPROVED_SITES.map((group) => (
                    <div key={group.region} className="rounded-[24px] border border-border bg-background p-4">
                      <p className="text-sm font-semibold text-foreground">{group.region}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.sites.map((site) => (
                          <span key={site} className="rounded-full border border-border bg-muted px-3 py-1.5 text-[12px] text-foreground">
                            {site}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card rounded-[32px] p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Service Hour Guidelines</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">Required, Ignatian, and tracked clearly</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  The Mission & Ministry Ignatian Service Program is rooted in the belief of St. Ignatius that love is shown in deeds rather than in words. Students are invited to become men for and with others by stepping beyond their usual experience and serving people who are materially poor, marginalized, disadvantaged, or living with disability.
                </p>
                <div className="mt-4 rounded-[24px] border border-border bg-muted/35 p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Service Hour Requirement</p>
                  <div className="mt-3 space-y-2">
                    {SERVICE_HOUR_REQUIREMENTS.map((item) => (
                      <p key={item} className="text-sm text-foreground">{item}</p>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-[24px] border border-border bg-background p-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">MobileServe</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Service hours are tracked by the Office of Mission & Ministry through MobileServe. Students should download the app through the App Store or Google Play Store, or use the web version at{" "}
                    <a
                      href="https://mobileserve.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[hsl(var(--primary))]"
                    >
                      mobileserve.com
                    </a>
                    .
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

      {tab === "kairos" ? (
        <section className="space-y-4">
          <div className="px-1">
            <h2 className="text-2xl font-semibold tracking-[-0.05em] text-foreground">Kairos</h2>
            <p className="mt-1 text-sm text-muted-foreground">{TYPE_META.KAIROS.description}</p>
          </div>
          {kairosPrograms.length === 0 ? (
            <div className="surface-card rounded-[28px] border-dashed p-8 text-center">
              <p className="text-base font-semibold text-foreground">Nothing published here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Mission & Ministry will post the next Kairos update here.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {kairosPrograms.map((program, index) => {
                const capacityReached = program.capacity !== null && program.signupCount >= program.capacity && !program.signedUp;
                return (
                  <motion.article
                    key={program.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.03 }}
                    className="overflow-hidden rounded-[30px] border border-border bg-card shadow-card"
                  >
                    <div className={cn("p-5 sm:p-6", "bg-gradient-to-br", TYPE_META.KAIROS.accent)} style={{ backgroundImage: `linear-gradient(135deg, ${program.colorFrom}20, ${program.colorTo}18)` }}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-2xl font-semibold tracking-[-0.05em] text-foreground">{program.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{program.summary}</p>
                        </div>
                        <div className="rounded-[22px] border border-white/40 bg-white/70 px-4 py-3 text-sm text-foreground shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sign-ups</p>
                          <p className="mt-1 text-xl font-semibold">{program.signupCount}{program.capacity ? `/${program.capacity}` : ""}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 p-5 sm:p-6">
                      <p className="text-sm leading-7 text-muted-foreground">{program.description}</p>
                      <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDateRange(program.startDate, program.endDate)}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{program.location}</div>
                      </div>
                      <Button size="lg" onClick={() => handleSignup(program.id)} disabled={isPending || (!program.registrationOpen && !program.signedUp) || capacityReached}>
                        {program.signedUp ? "Cancel sign-up" : capacityReached ? "Program full" : "Sign up"}
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {tab === "retreat" ? (
        <section className="space-y-4">
          <div className="px-1">
            <h2 className="text-2xl font-semibold tracking-[-0.05em] text-foreground">Retreats</h2>
            <p className="mt-1 text-sm text-muted-foreground">{TYPE_META.RETREAT.description}</p>
          </div>
          {retreatPrograms.length === 0 ? (
            <div className="surface-card rounded-[28px] border-dashed p-8 text-center">
              <p className="text-base font-semibold text-foreground">Nothing published here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Mission & Ministry will post the next retreat here.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {retreatPrograms.map((program, index) => {
                const capacityReached = program.capacity !== null && program.signupCount >= program.capacity && !program.signedUp;
                return (
                  <motion.article
                    key={program.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.03 }}
                    className="overflow-hidden rounded-[30px] border border-border bg-card shadow-card"
                  >
                    <div className={cn("p-5 sm:p-6", "bg-gradient-to-br", TYPE_META.RETREAT.accent)} style={{ backgroundImage: `linear-gradient(135deg, ${program.colorFrom}20, ${program.colorTo}18)` }}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-2xl font-semibold tracking-[-0.05em] text-foreground">{program.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{program.summary}</p>
                        </div>
                        <div className="rounded-[22px] border border-white/40 bg-white/70 px-4 py-3 text-sm text-foreground shadow-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sign-ups</p>
                          <p className="mt-1 text-xl font-semibold">{program.signupCount}{program.capacity ? `/${program.capacity}` : ""}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 p-5 sm:p-6">
                      <p className="text-sm leading-7 text-muted-foreground">{program.description}</p>
                      <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDateRange(program.startDate, program.endDate)}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{program.location}</div>
                      </div>
                      <Button size="lg" onClick={() => handleSignup(program.id)} disabled={isPending || (!program.registrationOpen && !program.signedUp) || capacityReached}>
                        {program.signedUp ? "Cancel sign-up" : capacityReached ? "Program full" : "Sign up"}
                      </Button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
