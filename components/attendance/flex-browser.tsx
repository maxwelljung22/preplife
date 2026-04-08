"use client";

import { useMemo, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { AttendanceStatus, AttendanceSessionType } from "@prisma/client";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, MapPin, QrCode, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { joinFlexSession } from "@/app/(app)/flex/actions";
import { FLEX_BLOCK_LABEL, getAttendanceStatusLabel, getSessionAccent, getSessionTypeLabel } from "@/lib/flex-attendance";
import { cn } from "@/lib/utils";

type FlexSessionCard = {
  id: string;
  title: string;
  type: AttendanceSessionType;
  location: string;
  capacity: number;
  attendeeCount: number;
  hostName: string;
  clubId: string | null;
};

const SECTION_ORDER: AttendanceSessionType[] = ["CLUB", "STUDY_HALL", "EVENT"];

const SECTION_COPY: Record<AttendanceSessionType, string> = {
  CLUB: "Club meetings and recurring flex groups from across HawkLife.",
  STUDY_HALL: "Quiet rooms and structured spaces for getting work done.",
  EVENT: "One-off sessions, speaker visits, and campus-wide opportunities.",
};

export function FlexBrowser({
  sessions,
  selectedDate,
  availableDates,
  joinedSessionId,
  joinedStatus,
}: {
  sessions: FlexSessionCard[];
  selectedDate: string;
  availableDates: string[];
  joinedSessionId: string | null;
  joinedStatus: AttendanceStatus | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [optimisticSessionId, setOptimisticSessionId] = useOptimistic(joinedSessionId, (_previous, next: string | null) => next);
  const selectedDateObject = useMemo(() => new Date(`${selectedDate}T12:00:00`), [selectedDate]);
  const selectedDateLabel = useMemo(
    () =>
      selectedDateObject.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    [selectedDateObject]
  );
  const todayDateValue = new Date().toISOString().slice(0, 10);
  const canGoBack = selectedDate > todayDateValue;

  const groupedSessions = useMemo(() => {
    return SECTION_ORDER.map((type) => ({
      type,
      title: type === "CLUB" ? "Clubs" : type === "STUDY_HALL" ? "Study Halls" : "Events",
      description: SECTION_COPY[type],
      items: sessions.filter((session) => session.type === type),
    }));
  }, [sessions]);

  const joinedSession = sessions.find((session) => session.id === optimisticSessionId) ?? null;
  const quickDates = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + index);
      return next.toISOString().slice(0, 10);
    });
  }, []);

  const navigateToDate = (date: string) => {
    router.push(`/flex?date=${date}`);
  };

  const handleJoin = (sessionId: string) => {
    setOptimisticSessionId(sessionId);

    startTransition(async () => {
      const result = await joinFlexSession(sessionId);

      if ("error" in result) {
        setOptimisticSessionId(joinedSessionId);
        toast({
          title: "Couldn't join session",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Session joined",
        description: "Your flex selection is locked in and ready for QR check-in.",
      });
      router.refresh();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
    >
      <section className="surface-panel overflow-hidden rounded-[32px] p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Hawk Attendance System
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-[3.2rem]">
              Flex Block
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              Browse flex blocks by day, join the spot you want, and scan in when you arrive. One tap switches your
              flex choice for the selected date instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="surface-subtle rounded-[24px] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected day</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-foreground">{selectedDateLabel}</p>
            </div>
            <div className="surface-subtle rounded-[24px] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sessions</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-foreground">{sessions.length}</p>
            </div>
            <div className="surface-subtle rounded-[24px] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your status</p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-foreground">
                {joinedStatus ? getAttendanceStatusLabel(joinedStatus) : "Not joined"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Browse dates</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">See flex blocks beyond today</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Switch dates to preview upcoming flex options and join your choice before the day arrives.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="secondary"
              onClick={() => {
                const previous = new Date(selectedDateObject.getFullYear(), selectedDateObject.getMonth(), selectedDateObject.getDate() - 1);
                navigateToDate(previous.toISOString().slice(0, 10));
              }}
              disabled={!canGoBack}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous day
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const next = new Date(selectedDateObject.getFullYear(), selectedDateObject.getMonth(), selectedDateObject.getDate() + 1);
                navigateToDate(next.toISOString().slice(0, 10));
              }}
            >
              Next day
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <input
            type="date"
            min={todayDateValue}
            value={selectedDate}
            onChange={(event) => navigateToDate(event.target.value)}
            className="h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 focus:border-[hsl(var(--ring))]"
          />

          <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full flex-nowrap gap-2">
              {quickDates.map((date) => {
                const label = new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
                const hasSessions = availableDates.includes(date);
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => navigateToDate(date)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-[12px] font-medium transition-colors",
                      selectedDate === date
                        ? "border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.08)] text-foreground"
                        : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {label}{hasSessions ? " · Open" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        {groupedSessions.map((section) => (
          <section key={section.type} className="space-y-4">
            <div className="px-1">
              <h2 className="text-2xl font-semibold tracking-[-0.05em] text-foreground">{section.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>

            {section.items.length === 0 ? (
              <div className="surface-card rounded-[28px] border-dashed p-8 text-center">
                <p className="text-base font-semibold text-foreground">No {section.title.toLowerCase()} scheduled yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Faculty can open sessions for this date from the session creation tools.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((session, index) => {
                  const isJoined = optimisticSessionId === session.id;
                  const capacityReached = session.attendeeCount >= session.capacity && !isJoined;

                  return (
                    <motion.article
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: index * 0.03 }}
                      whileHover={{ y: -3 }}
                      className={cn(
                        "relative overflow-hidden rounded-[28px] border bg-card/90 p-5 shadow-card transition-all duration-200",
                        isJoined ? "border-[hsl(var(--primary)/0.25)] shadow-[0_20px_46px_rgba(139,26,26,0.12)]" : "border-border"
                      )}
                    >
                      <div className={cn("absolute inset-x-0 top-0 h-28 bg-gradient-to-br opacity-80", getSessionAccent(session.type))} />
                      <div className="relative space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {getSessionTypeLabel(session.type)}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold tracking-[-0.05em] text-foreground">{session.title}</h3>
                          </div>
                          <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                            {session.attendeeCount}/{session.capacity}
                          </span>
                        </div>

                        <div className="grid gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Hosted by {session.hostName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            <span>{selectedDateLabel} · {FLEX_BLOCK_LABEL}</span>
                          </div>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.985 }}
                          onClick={() => handleJoin(session.id)}
                          disabled={isPending || capacityReached}
                          className={cn(
                            "flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all duration-200",
                            isJoined
                              ? "bg-[hsl(var(--primary))] text-white shadow-[0_18px_34px_rgba(139,26,26,0.18)]"
                              : "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200",
                            capacityReached && "cursor-not-allowed opacity-55"
                          )}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={isJoined ? "joined" : "join"}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.16 }}
                              className="inline-flex items-center gap-2"
                            >
                              {isJoined ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Joined
                                </>
                              ) : capacityReached ? (
                                "Full"
                              ) : (
                                <>
                                  Join session
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              )}
                            </motion.span>
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      <AnimatePresence>
        {joinedSession ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="sticky bottom-4 z-30 rounded-[28px] border border-border bg-background/92 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Your flex spot
                </p>
                <p className="mt-2 truncate text-lg font-semibold tracking-[-0.05em] text-foreground">{joinedSession.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Head to the room on {selectedDateLabel} and scan the QR code when you arrive.
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/scan" className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full min-w-[160px]">
                    <QrCode className="h-4 w-4" />
                    Scan QR
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
