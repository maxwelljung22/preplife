"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const INTRO_FEATURES = [
  "Flex Block",
  "Club Directory",
  "All-in-one Calendar",
  "Attendance",
  "Polls",
  "Announcements",
] as const;

const QR_PATTERN = [
  1, 1, 1, 0, 1, 1, 0, 1, 1,
  1, 0, 1, 0, 0, 1, 0, 0, 1,
  1, 1, 1, 0, 1, 1, 1, 0, 1,
  0, 0, 0, 1, 0, 0, 1, 0, 0,
  1, 1, 0, 0, 1, 1, 0, 1, 1,
  1, 0, 1, 0, 0, 1, 0, 0, 1,
  0, 1, 1, 1, 1, 0, 1, 1, 0,
  1, 0, 0, 0, 1, 0, 0, 1, 1,
  1, 1, 1, 0, 1, 1, 0, 1, 1,
] as const;

const INTRO_DURATION_MS = 23_000;
const FEATURE_DURATION_MS = 800;

type IntroSceneId =
  | "welcome"
  | "subtitle"
  | "features"
  | "qr"
  | "phone"
  | "final"
  | "start";

const INTRO_SCHEDULE: Array<{ id: IntroSceneId; at: number }> = [
  { id: "welcome", at: 0 },
  { id: "subtitle", at: 2_000 },
  { id: "features", at: 5_000 },
  { id: "qr", at: 10_000 },
  { id: "phone", at: 14_000 },
  { id: "final", at: 18_000 },
  { id: "start", at: 21_000 },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } },
};

const sceneVariants = {
  initial: { opacity: 0, y: 24, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -18, scale: 1.01, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
};

function IntroSceneFrame({ children, align = "center" }: { children: ReactNode; align?: "center" | "split" }) {
  return (
    <motion.div
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "absolute inset-0 flex w-full items-center px-6 pb-14 pt-24 sm:px-10 sm:pb-16 sm:pt-28",
        align === "center" ? "justify-center text-center" : "justify-center"
      )}
    >
      {children}
    </motion.div>
  );
}

function WelcomeScene() {
  return (
    <IntroSceneFrame>
      <div className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/38">HawkLife</p>
        <h1 className="max-w-5xl text-balance font-display text-[clamp(3rem,10vw,7rem)] font-semibold tracking-[-0.08em] text-white">
          Welcome to HawkLife
        </h1>
      </div>
    </IntroSceneFrame>
  );
}

function SubtitleScene() {
  return (
    <IntroSceneFrame>
      <div className="space-y-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-white/32">HawkLife</p>
        <h2 className="max-w-4xl text-balance font-display text-[clamp(2.6rem,8vw,6rem)] font-semibold tracking-[-0.08em] text-white">
          Your school. Reimagined.
        </h2>
      </div>
    </IntroSceneFrame>
  );
}

function FeaturesScene({ featureIndex }: { featureIndex: number }) {
  return (
    <IntroSceneFrame>
      <div className="relative flex w-full max-w-5xl flex-col items-center">
        <div className="absolute inset-x-[18%] top-1/2 -z-10 h-56 -translate-y-1/2 rounded-full bg-white/[0.07] blur-[140px]" />
        <p className="mb-10 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/34">Built around the day</p>
        <div className="relative min-h-[5.5rem] sm:min-h-[7rem]">
          <AnimatePresence mode="wait">
            <motion.h2
              key={INTRO_FEATURES[featureIndex]}
              initial={{ opacity: 0, y: 24, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 1.015 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance font-display text-[clamp(2.5rem,8vw,6rem)] font-semibold tracking-[-0.08em] text-white"
            >
              {INTRO_FEATURES[featureIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>
    </IntroSceneFrame>
  );
}

function QrScene() {
  return (
    <IntroSceneFrame>
      <div className="flex w-full max-w-3xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_36px_100px_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-5"
        >
          <div className="grid grid-cols-9 gap-1 rounded-[1.35rem] bg-white p-4 sm:p-5">
            {QR_PATTERN.map((cell, index) => (
              <motion.span
                key={index}
                animate={{ opacity: cell ? [0.72, 1, 0.72] : 1, scale: cell ? [1, 1.04, 1] : 1 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.012 }}
                className={cn("h-3.5 w-3.5 rounded-[4px] sm:h-5 sm:w-5", cell ? "bg-black" : "bg-transparent")}
              />
            ))}
          </div>
        </motion.div>
        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/34">Attendance</p>
        <h2 className="mt-4 max-w-3xl text-balance font-display text-[clamp(2.2rem,7vw,5.2rem)] font-semibold tracking-[-0.08em] text-white">
          Real attendance. Instantly.
        </h2>
      </div>
    </IntroSceneFrame>
  );
}

function PhoneScene() {
  return (
    <IntroSceneFrame>
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 text-center lg:order-1 lg:text-left"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/34">Mobile first</p>
          <h2 className="mt-5 text-balance font-display text-[clamp(2.4rem,7vw,5.5rem)] font-semibold tracking-[-0.08em] text-white">
            Built for your phone.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 mx-auto w-full max-w-[18rem] rounded-[2.8rem] border border-white/10 bg-white/[0.06] p-3 shadow-[0_42px_140px_rgba(255,255,255,0.08)] lg:order-2"
        >
          <div className="rounded-[2.25rem] border border-white/10 bg-black px-4 pb-5 pt-4">
            <div className="mx-auto h-1.5 w-20 rounded-full bg-white/14" />
            <div className="mt-5 rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/38">Today at Prep</p>
              <p className="mt-3 font-display text-[1.6rem] tracking-[-0.06em] text-white">Everything in one place</p>
              <div className="mt-5 space-y-3">
                {["Flex check-in", "Club announcements", "Calendar updates"].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.34, delay: 0.14 + index * 0.08 }}
                    className="flex items-center justify-between rounded-[1.15rem] border border-white/8 bg-white/[0.04] px-4 py-3"
                  >
                    <span className="text-[0.94rem] text-white/84">{item}</span>
                    <span className="h-2.5 w-2.5 rounded-full bg-white/72" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </IntroSceneFrame>
  );
}

function FinalScene() {
  return (
    <IntroSceneFrame>
      <div className="space-y-4">
        <h2 className="max-w-4xl text-balance font-display text-[clamp(2.6rem,8vw,6.2rem)] font-semibold tracking-[-0.08em] text-white">
          Everything your school needs.
        </h2>
        <p className="text-balance font-display text-[clamp(2rem,6vw,4.5rem)] tracking-[-0.07em] text-white/72">
          All in one place.
        </p>
      </div>
    </IntroSceneFrame>
  );
}

function StartScene() {
  return (
    <IntroSceneFrame>
      <div className="space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/30">HawkLife</p>
        <h2 className="text-balance font-display text-[clamp(2.8rem,8vw,5.8rem)] font-semibold tracking-[-0.08em] text-white">
          Let&apos;s get started.
        </h2>
      </div>
    </IntroSceneFrame>
  );
}

function IntroSequence({
  onDismiss,
  persistSeen,
}: {
  onDismiss: () => void;
  persistSeen: () => void;
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const [scene, setScene] = useState<IntroSceneId>("welcome");
  const [featureIndex, setFeatureIndex] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    for (const item of INTRO_SCHEDULE.slice(1)) {
      timers.push(setTimeout(() => setScene(item.id), reduceMotion ? Math.max(0, item.at * 0.55) : item.at));
    }

    const featureStart = reduceMotion ? 2_800 : 5_000;
    timers.push(
      setTimeout(() => {
        let current = 0;
        const interval = setInterval(() => {
          current += 1;
          setFeatureIndex((prev) => (prev < INTRO_FEATURES.length - 1 ? prev + 1 : prev));
          if (current >= INTRO_FEATURES.length - 1) {
            clearInterval(interval);
          }
        }, reduceMotion ? 420 : FEATURE_DURATION_MS);

        timers.push(interval);
      }, featureStart)
    );

    timers.push(
      setTimeout(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        persistSeen();
        onDismiss();
      }, reduceMotion ? 8_500 : INTRO_DURATION_MS)
    );

    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
        clearInterval(timer);
      }
    };
  }, [onDismiss, persistSeen, reduceMotion]);

  const renderedScene = useMemo(() => {
    switch (scene) {
      case "welcome":
        return <WelcomeScene />;
      case "subtitle":
        return <SubtitleScene />;
      case "features":
        return <FeaturesScene featureIndex={featureIndex} />;
      case "qr":
        return <QrScene />;
      case "phone":
        return <PhoneScene />;
      case "final":
        return <FinalScene />;
      case "start":
        return <StartScene />;
      default:
        return null;
    }
  }, [featureIndex, scene]);

  const handleSkip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    persistSeen();
    onDismiss();
  };

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[200] overflow-hidden bg-black text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.04),transparent_20%)]" />
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 1.2 }}
        onClick={handleSkip}
        className="absolute right-4 top-4 z-10 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/76 backdrop-blur transition-colors hover:bg-white/[0.09] hover:text-white sm:right-8 sm:top-8"
      >
        Skip
      </motion.button>

      <AnimatePresence mode="wait">{renderedScene}</AnimatePresence>
    </motion.div>
  );
}

export function FirstRunIntroGate({
  children,
  userId,
  shouldShowInitially,
}: {
  children: ReactNode;
  userId: string;
  shouldShowInitially: boolean;
}) {
  const storageKey = `hawklife:intro-seen:${userId}`;
  const [shouldShow, setShouldShow] = useState(false);
  const [ready, setReady] = useState(false);
  const persistedRef = useRef(false);

  useEffect(() => {
    const storedValue = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    setShouldShow(shouldShowInitially && storedValue !== "true");
    setReady(true);
  }, [shouldShowInitially, storageKey]);

  useEffect(() => {
    if (!shouldShow) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [shouldShow]);

  const persistSeen = async () => {
    if (persistedRef.current) return;
    persistedRef.current = true;

    window.localStorage.setItem(storageKey, "true");

    try {
      await fetch("/api/intro/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to persist intro completion", error);
    }
  };

  return (
    <>
      {children}
      {ready ? (
        <AnimatePresence>{shouldShow ? <IntroSequence onDismiss={() => setShouldShow(false)} persistSeen={persistSeen} /> : null}</AnimatePresence>
      ) : null}
    </>
  );
}
