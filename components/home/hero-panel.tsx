"use client";

import { motion, useReducedMotion } from "framer-motion";

const PILLS = [
  { label: "Club Directory",  dot: "#BF1919" },
  { label: "NHS Hours",       dot: "#B89240" },
  { label: "Calendar",        dot: "#4A8DB8" },
  { label: "Applications",    dot: "#3D8A5C" },
  { label: "Announcements",   dot: "#7B5EA0" },
] as const;

const EASE_OUT = [0.4, 0, 0.2, 1] as const;

export function HeroPanel() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="relative flex-[0_0_55%] flex flex-col justify-center overflow-hidden"
      style={{ background: "#0C1824", padding: "60px 72px" }}
      aria-label="Hero"
    >
      {/* Ambient orbs */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 420, height: 420, top: -100, left: -80, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,15,15,.32) 0%, transparent 70%)", filter: "blur(80px)" }}
        animate={shouldReduce ? {} : { x: [0,18,-12,0], y: [0,-22,14,0], scale: [1,1.04,0.97,1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute pointer-events-none"
        style={{ width: 360, height: 360, bottom: -80, right: -60, borderRadius: "50%", background: "radial-gradient(circle, rgba(28,51,70,.9) 0%, rgba(138,110,47,.15) 60%, transparent 100%)", filter: "blur(80px)" }}
        animate={shouldReduce ? {} : { x: [0,-20,14,0], y: [0,16,-18,0], scale: [1,1.06,0.95,1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.024) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.024) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "linear-gradient(135deg, transparent 30%, rgba(0,0,0,.5) 70%, transparent 100%)" }}
        aria-hidden="true"
      />
      <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,.07) 25%, rgba(255,255,255,.12) 50%, rgba(255,255,255,.07) 75%, transparent)" }} aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-[520px]">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.52, ease: EASE_OUT, delay: 0.1 } }} className="flex items-center gap-3 mb-14">
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "#8B0F0F", boxShadow: "0 4px 16px rgba(139,15,15,.45)" }}>
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M2 4.5h13M4.5 8.5h8M7 12.5h3" /></svg>
          </div>
          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "rgba(184,146,64,.55)" }} />
          <span style={{ color: "rgba(255,255,255,.45)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>PrepLife</span>
        </motion.div>

        {/* Eyebrow */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.52, ease: EASE_OUT, delay: 0.22 } }} className="flex items-center gap-2.5 mb-5">
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.55 } }} style={{ width: 28, height: 1, background: "linear-gradient(to right, #B89240, transparent)", transformOrigin: "left" }} />
          <span style={{ color: "#B89240", fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase" }}>St. Joseph&apos;s Preparatory · Est. 1851</span>
        </motion.div>

        {/* Headline */}
        <h1 style={{ lineHeight: 1.06, marginBottom: 24 }}>
          <div style={{ overflow: "hidden" }}>
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.35 } }}>
              <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "clamp(38px, 4.2vw, 58px)", fontWeight: 400, letterSpacing: "-.025em", color: "#F4F0E8" }}>Your school,</span>
            </motion.div>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { duration: 0.6, ease: EASE_OUT, delay: 0.47 } }}>
              <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: "clamp(38px, 4.2vw, 58px)", fontWeight: 400, letterSpacing: "-.025em", color: "#F4F0E8" }}>
                one{" "}
                <em style={{ fontStyle: "italic", color: "rgba(244,240,232,.6)" }}>platform.</em>
              </span>
            </motion.div>
          </div>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.52, ease: EASE_OUT, delay: 0.62 } }}
          style={{ fontSize: 15.5, lineHeight: 1.68, color: "rgba(255,255,255,.4)", marginBottom: 44, maxWidth: 400 }}
        >
          Clubs, NHS hours, announcements, events, and applications — all in one place, built for the Prep community.
        </motion.p>

        {/* Pills */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.52, ease: EASE_OUT, delay: 0.78 } }} className="flex flex-wrap gap-2">
          {PILLS.map((pill) => (
            <motion.div
              key={pill.label}
              className="inline-flex items-center gap-1.5 cursor-default select-none"
              style={{ padding: "6px 13px", borderRadius: 999, background: "rgba(255,255,255,.055)", border: "1px solid rgba(255,255,255,.09)", color: "rgba(255,255,255,.52)", fontSize: 12, fontWeight: 500, backdropFilter: "blur(8px)" }}
              whileHover={{ background: "rgba(255,255,255,.09)", borderColor: "rgba(255,255,255,.16)", color: "rgba(255,255,255,.8)", y: -1 }}
              transition={{ duration: 0.18 }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: pill.dot, flexShrink: 0, display: "inline-block" }} />
              {pill.label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.1, duration: 0.5 } }} className="absolute bottom-7 flex items-center" style={{ left: 72, right: 72 }}>
        <span style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.18)", fontFamily: "var(--font-mono)" }}>Philadelphia, PA</span>
        <div className="flex-1 h-px mx-5" style={{ background: "rgba(255,255,255,.06)" }} />
        <span style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(255,255,255,.18)", fontFamily: "var(--font-mono)" }}>SJP Student Platform</span>
      </motion.div>
    </section>
  );
}
