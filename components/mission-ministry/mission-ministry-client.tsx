"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Heart, MapPin, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  createMinistryProgram,
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
  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    type: "SERVICE_OPPORTUNITY" as ProgramType,
    location: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    capacity: "",
    isFeatured: false,
    colorFrom: "#8B1A1A",
    colorTo: "#D97706",
    imageUrl: "",
  });

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

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createMinistryProgram(form);
      if ("error" in result) {
        toast({ title: "Couldn't publish program", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: "Mission & Ministry update published" });
      setForm({
        title: "",
        summary: "",
        description: "",
        type: "SERVICE_OPPORTUNITY",
        location: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        capacity: "",
        isFeatured: false,
        colorFrom: "#8B1A1A",
        colorTo: "#D97706",
        imageUrl: "",
      });
    });
  };

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="relative overflow-hidden rounded-[34px] border border-border bg-[linear-gradient(135deg,rgba(139,26,26,0.12),rgba(217,119,6,0.1),rgba(14,165,233,0.08))] p-6 shadow-[0_26px_80px_rgba(15,23,42,0.08)] sm:p-8">
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
        <section className="surface-card rounded-[32px] p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Department controls</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">Publish a Mission & Ministry program</h2>
            </div>
            <div className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
              Mission & Ministry staff only
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Program title" />
            <Input value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="Short summary" />
            <div className="lg:col-span-2">
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe what this experience is, who it's for, and what students should expect."
                rows={5}
                className="w-full rounded-[24px] border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-950 outline-none transition-all duration-200 focus:border-neutral-300 focus:ring-4 focus:ring-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:focus:border-neutral-700 dark:focus:ring-white/10"
              />
            </div>
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ProgramType }))}
              className="h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-950 outline-none transition-all duration-200 focus:border-neutral-300 focus:ring-4 focus:ring-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:focus:border-neutral-700 dark:focus:ring-white/10"
            >
              {PROGRAM_TYPES.map((type) => (
                <option key={type} value={type}>{TYPE_META[type].label}</option>
              ))}
            </select>
            <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" />
            <Input type="datetime-local" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} />
            <Input type="datetime-local" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} />
            <Input type="datetime-local" value={form.registrationDeadline} onChange={(event) => setForm((current) => ({ ...current, registrationDeadline: event.target.value }))} />
            <Input type="number" min={1} max={500} value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} placeholder="Capacity (optional)" />
            <Input value={form.colorFrom} onChange={(event) => setForm((current) => ({ ...current, colorFrom: event.target.value }))} placeholder="#8B1A1A" />
            <Input value={form.colorTo} onChange={(event) => setForm((current) => ({ ...current, colorTo: event.target.value }))} placeholder="#D97706" />
            <div className="lg:col-span-2">
              <Input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Optional https image URL" />
            </div>
          </div>

          <label className="mt-4 inline-flex items-center gap-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))}
              className="h-4 w-4 rounded border-border"
            />
            Feature this on the top of the dashboard
          </label>

          <Button size="lg" className="mt-4 w-full sm:w-auto" onClick={handleCreate} disabled={isPending}>
            <Sparkles className="h-4 w-4" />
            Publish program
          </Button>
        </section>
      ) : null}

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

      {groupedPrograms.map((section) => (
        <section key={section.type} className="space-y-4">
          <div className="px-1">
            <h2 className="text-2xl font-semibold tracking-[-0.05em] text-foreground">{section.meta.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{section.meta.description}</p>
          </div>

          {section.type === "SERVICE_OPPORTUNITY" ? (
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="surface-card rounded-[30px] p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live Service Calendar</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">Upcoming service opportunities pulled from SignUpGenius</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Swipe across to see everything coming up, then jump straight into the live signup.
                    </p>
                  </div>
                  <Link
                    href={SERVICE_SIGNUP_GENIUS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Open live signup
                  </Link>
                </div>

                <div className="mt-5 -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
                  {serviceEvents.length > 0 ? (
                    serviceEvents.map((event) => (
                      <article
                        key={event.id}
                        className="min-w-[280px] snap-start rounded-[28px] border border-border bg-[linear-gradient(160deg,rgba(139,26,26,0.1),rgba(217,119,6,0.12),rgba(14,165,233,0.08))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:min-w-[320px]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              {event.isFull ? "Currently full" : "Open opportunity"}
                            </p>
                            <h4 className="mt-2 text-xl font-semibold tracking-[-0.05em] text-foreground">{event.title}</h4>
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
                          <div className="flex items-start gap-2">
                            <Users className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                              {Math.max(event.seatsTotal - event.seatsTaken, 0)} spots left
                              {event.isFull ? " · join waitlist if available" : ""}
                            </span>
                          </div>
                        </div>

                        <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted-foreground">{event.description}</p>

                        <Link
                          href={event.signupUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex items-center justify-center rounded-2xl border border-border bg-white/80 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white"
                        >
                          Sign up in SignUpGenius
                        </Link>
                      </article>
                    ))
                  ) : (
                    <div className="w-full rounded-[24px] border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                      The live service feed is temporarily unavailable. You can still use the SignUpGenius button above.
                    </div>
                  )}
                </div>
              </div>

              <div className="surface-card rounded-[30px] p-5 sm:p-6">
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
                  {RECURRING_SERVICE_OPPORTUNITIES.map((item) => (
                    <div key={item.title} className="rounded-[24px] border border-border bg-muted/30 p-4">
                      <h4 className="text-[1.05rem] font-semibold tracking-[-0.04em] text-foreground">{item.title}</h4>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="surface-card rounded-[30px] p-5 sm:p-6">
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
                </div>

                <div className="surface-card rounded-[30px] p-5 sm:p-6">
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
                </div>
              </div>
            </div>
          ) : null}

          {section.items.length === 0 ? (
            <div className="surface-card rounded-[28px] border-dashed p-8 text-center">
              <p className="text-base font-semibold text-foreground">Nothing published here yet</p>
              <p className="mt-2 text-sm text-muted-foreground">Mission & Ministry will post the next update here.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {section.items.map((program, index) => {
                const capacityReached = program.capacity !== null && program.signupCount >= program.capacity && !program.signedUp;
                return (
                  <motion.article
                    key={program.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: index * 0.03 }}
                    className="overflow-hidden rounded-[30px] border border-border bg-card shadow-card"
                  >
                    <div className={cn("p-5 sm:p-6", "bg-gradient-to-br", section.meta.accent)} style={{ backgroundImage: `linear-gradient(135deg, ${program.colorFrom}20, ${program.colorTo}18)` }}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-2">
                            {program.isFeatured ? (
                              <span className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                                Featured
                              </span>
                            ) : null}
                            <span className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                              {section.meta.label}
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
          )}
        </section>
      ))}
    </div>
  );
}
