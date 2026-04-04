"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ClipboardCheck, LayoutGrid, Megaphone, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const FEATURE_CARDS = [
  {
    title: "Club directory",
    subtitle: "For The Prep",
    body: "Discover clubs, compare commitments, and find your people fast.",
    icon: LayoutGrid,
    accent: "from-[#ff8f52] via-[#ff4d7a] to-[#8a2eff]",
  },
  {
    title: "Charter applications",
    subtitle: "Built for St. Joe's Prep",
    body: "Launch new clubs with a polished workflow that feels clear from start to finish.",
    icon: ClipboardCheck,
    accent: "from-[#7a101e] via-[#c22c44] to-[#f08b7f]",
  },
  {
    title: "Announcements",
    subtitle: "Signal, not noise",
    body: "Share the updates that actually matter across St. Joseph's Preparatory School.",
    icon: Megaphone,
    accent: "from-[#1d274e] via-[#3556ac] to-[#8cb9ff]",
  },
];

export function HeroPanel() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#06080e] px-5 py-6 text-white shadow-[0_40px_120px_rgba(0,0,0,0.34)] sm:px-7 sm:py-8 lg:px-8 lg:py-9 xl:flex-[1.15]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 18%, rgba(196,46,63,0.18), transparent 24%), radial-gradient(circle at 78% 72%, rgba(80,120,255,0.14), transparent 28%), linear-gradient(180deg, #06080e 0%, #0a0e18 48%, #06080d 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(circle at center, black, transparent 82%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-12 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(118,80,255,.22),transparent_68%)] blur-3xl"
        animate={reduceMotion ? {} : { scale: [1, 1.06, 0.98, 1], opacity: [0.8, 1, 0.88, 0.8] }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <BrandLogo tone="inverse" />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/64">
              <Sparkles className="h-3 w-3" />
              St. Joseph&apos;s Preparatory School
            </div>
          </div>

          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/54">
            Built for The Prep
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
          <div className="max-w-[720px]">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } }}
              className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/44"
            >
              Campus OS for The Prep
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.72, ease: EASE_OUT, delay: 0.08 } }}
              className="text-balance text-[clamp(42px,7vw,94px)] font-semibold leading-[0.94] tracking-[-0.08em]"
              style={{ fontFamily: "Satoshi, var(--font-body)" }}
            >
              HawkLife
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.16 } }}
              className="mt-5 max-w-[620px] text-balance text-[15px] leading-7 text-white/56 sm:text-[16px]"
            >
              The polished student platform for St. Joseph&apos;s Preparatory School. Clubs, announcements, NHS hours, charter applications, and schedules all move in one sharper rhythm.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE_OUT, delay: 0.24 } }}
              className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">This week at The Prep</p>
              <p className="mt-3 text-[30px] font-semibold tracking-[-0.06em] text-white sm:text-[36px]" style={{ fontFamily: "Satoshi, var(--font-body)" }}>
                18 clubs. 12 events. 1 place.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Club momentum</p>
                  <p className="mt-3 text-[28px] font-semibold tracking-[-0.05em] text-white" style={{ fontFamily: "Satoshi, var(--font-body)" }}>
                    94%
                  </p>
                  <p className="mt-2 text-[12px] leading-6 text-white/50">Applications, approvals, and leadership updates move in one clean flow.</p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">School-wide view</p>
                  <p className="mt-3 text-[15px] font-semibold tracking-[-0.03em] text-white" style={{ fontFamily: "Satoshi, var(--font-body)" }}>
                    Clearer decisions for St. Joseph&apos;s Preparatory School
                  </p>
                  <p className="mt-2 text-[12px] leading-6 text-white/50">A cleaner system for student life, faculty workflows, and club leadership.</p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">Live rhythm</p>
                  <div className="mt-3 space-y-2 text-[12px] text-white/64">
                    <div className="flex items-center justify-between rounded-full bg-white/[0.04] px-3 py-2">
                      <span>Meeting reminders</span>
                      <span>Today</span>
                    </div>
                    <div className="flex items-center justify-between rounded-full bg-white/[0.04] px-3 py-2">
                      <span>Charter reviews</span>
                      <span>2 pending</span>
                    </div>
                    <div className="flex items-center justify-between rounded-full bg-white/[0.04] px-3 py-2">
                      <span>NHS progress</span>
                      <span>Updated</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {FEATURE_CARDS.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE_OUT, delay: 0.24 + index * 0.08 } }}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl"
              >
                <div className={`h-28 bg-gradient-to-br ${card.accent}`} />
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/44">{card.subtitle}</p>
                    <card.icon className="h-4 w-4 text-white/70" />
                  </div>
                  <h3 className="text-[18px] font-semibold tracking-[-0.04em] text-white" style={{ fontFamily: "Satoshi, var(--font-body)" }}>
                    {card.title}
                  </h3>
                  <p className="text-[12.5px] leading-6 text-white/56">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/8 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32 sm:flex-row sm:items-center sm:justify-between">
          <span>Philadelphia, PA</span>
          <span>St. Joseph&apos;s Preparatory School student platform</span>
        </div>
      </div>
    </section>
  );
}
