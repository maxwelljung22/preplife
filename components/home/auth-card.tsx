"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { SignInState } from "./home-page";

interface AuthCardProps {
  state:        SignInState;
  errorMessage: string;
  onSignIn:     () => void;
}

export function AuthCard({ state, errorMessage, onSignIn }: AuthCardProps) {
  const shouldReduce = useReducedMotion();
  const isLoading = state === "loading";
  const isError   = state === "error";
  const isSuccess = state === "success";

  return (
    <motion.div
      className="relative w-full max-w-[380px]"
      initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.94, y: shouldReduce ? 0 : 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.52, ease: [0.34, 1.56, 0.64, 1], delay: 0.38 }}
    >
      <div
        className="relative w-full rounded-[20px] overflow-hidden"
        style={{
          background: "#FFFFFF",
          boxShadow: "0 0 0 1px rgba(0,0,0,.055), 0 2px 4px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06), 0 24px 64px rgba(0,0,0,.08)",
        }}
      >
        <div
          className="absolute top-0 left-6 right-6 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,15,15,.14), rgba(138,110,47,.10), transparent)" }}
          aria-hidden="true"
        />
        <div className="p-11">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center gap-4 py-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2D7A4F, #3D9A62)", boxShadow: "0 8px 24px rgba(45,122,79,.3)" }}>
                  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l5 5L21 7" /></svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, color: "#1A1410", marginBottom: 4 }}>Signed in!</h3>
                  <p style={{ fontSize: 14, color: "#6E6455" }}>Redirecting to your dashboard…</p>
                </div>
                <div className="w-full h-0.5 rounded-full overflow-hidden mt-2" style={{ background: "#F2EFE8" }}>
                  <motion.div className="h-full" style={{ background: "linear-gradient(to right, #8B0F0F, #B89240)", borderRadius: 99 }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.8, ease: "easeInOut" }} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}>
                <div className="w-12 h-12 rounded-[13px] flex items-center justify-center mb-6" style={{ background: "#8B0F0F", boxShadow: "0 4px 14px rgba(139,15,15,.35), 0 1px 0 rgba(255,255,255,.12) inset" }}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M11 2.5C6.3 2.5 2.5 6.3 2.5 11S6.3 19.5 11 19.5 19.5 15.7 19.5 11 15.7 2.5 11 2.5z" /><path d="M11 7v4l2.5 2.5" /></svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-.02em", color: "#1A1410", marginBottom: 6 }}>Welcome back.</h2>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6E6455", marginBottom: 32, maxWidth: 280 }}>Sign in with your St. Joe&apos;s Google account to access the platform.</p>
                <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #F2EFE8, transparent)", marginBottom: 32 }} />

                <AnimatePresence>
                  {isError && errorMessage && (
                    <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.25 }} className="mb-4 px-3.5 py-3 rounded-xl flex items-start gap-2.5" style={{ background: "rgba(139,15,15,.06)", border: "1px solid rgba(139,15,15,.12)" }} role="alert">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#8B0F0F" strokeWidth="1.4" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v2.5M7 9v.5" /></svg>
                      <p style={{ fontSize: 12.5, color: "#8B0F0F", lineHeight: 1.4 }}>{errorMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={onSignIn}
                  disabled={isLoading}
                  className="relative w-full h-[50px] rounded-xl flex items-center justify-center gap-2.5 overflow-hidden"
                  style={{ background: "#1A1410", color: "#fff", border: "none", fontFamily: "var(--font-body)", fontSize: "14.5px", fontWeight: 500, cursor: isLoading ? "not-allowed" : "pointer", boxShadow: "0 1px 0 rgba(255,255,255,.06) inset, 0 4px 14px rgba(0,0,0,.18)" }}
                  whileHover={!isLoading ? { background: "#2A2520", y: -1.5, boxShadow: "0 8px 24px rgba(0,0,0,.24)" } : undefined}
                  whileTap={!isLoading ? { scale: 0.99 } : undefined}
                  aria-label="Sign in with Google"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <motion.div className="w-4 h-4 border-2 rounded-full" style={{ borderColor: "rgba(255,255,255,.3)", borderTopColor: "#fff" }} animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} />
                      <span style={{ opacity: 0.7 }}>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <svg className="relative z-10 flex-shrink-0" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                      </svg>
                      <span className="relative z-10">Continue with Google</span>
                    </>
                  )}
                </motion.button>

                <div className="flex items-start gap-2.5 mt-5 px-3.5 py-3 rounded-[10px]" style={{ background: "#F8F6F1", border: "1px solid #F2EFE8" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#A89D8E" strokeWidth="1.4" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><circle cx="7" cy="7" r="5.5" /><path d="M7 6v3M7 4.5v.5" /></svg>
                  <p style={{ fontSize: 12, lineHeight: 1.55, color: "#6E6455" }}>
                    Restricted to <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#8B0F0F", background: "rgba(139,15,15,.07)", padding: "1px 4px", borderRadius: 4 }}>@sjprep.org</code> (faculty) and <code style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#8B0F0F", background: "rgba(139,15,15,.07)", padding: "1px 4px", borderRadius: 4 }}>@sjprephawks.org</code> (students).
                  </p>
                </div>
                <div className="mt-7 pt-5 border-t text-center" style={{ borderColor: "#F2EFE8" }}>
                  <p style={{ fontSize: 12, color: "#A89D8E", lineHeight: 1.5 }}>By signing in, you agree to the platform&apos;s terms of use. Managed by St. Joseph&apos;s Preparatory School.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
