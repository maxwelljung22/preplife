"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";

function SignInContent() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const error       = params.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "linear-gradient(180deg, #FCFAF6 0%, #F5EFE7 100%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-8">
          <div className="mb-5 flex justify-center">
            <BrandLogo />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "#1A1816", letterSpacing: "-.02em" }}>Welcome to PrepLife</h1>
          <p style={{ fontSize: 14, color: "#7C7A72", marginTop: 6 }}>St. Joseph&apos;s Preparatory School</p>
        </div>

        <div style={{ background: "rgba(255,255,255,.95)", border: "1px solid rgba(232,230,224,.95)", borderRadius: 24, padding: "28px 28px", boxShadow: "0 20px 64px rgba(15,23,42,.08)" }}>
          {error && (
            <div style={{ marginBottom: 20, padding: "12px 14px", background: "rgba(139,26,26,.06)", border: "1px solid rgba(139,26,26,.12)", borderRadius: 12 }}>
              <p style={{ fontSize: 13, color: "#8B1A1A", lineHeight: 1.5 }}>
                {error === "DomainNotAllowed"
                  ? "Only @sjprep.org and @sjprephawks.org accounts are allowed."
                  : "An error occurred. Please try again."}
              </p>
            </div>
          )}
          <p style={{ fontSize: 13.5, color: "#7C7A72", marginBottom: 20, lineHeight: 1.6 }}>Sign in with your St. Joe&apos;s school Google account.</p>
          <motion.button
            whileHover={{ scale: 1.01, boxShadow: "0 18px 38px rgba(16,17,20,.18)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("google", { callbackUrl })}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px 20px", background: "linear-gradient(135deg, #101114 0%, #1F2430 100%)", color: "#fff", border: "none", borderRadius: 18, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 14px 30px rgba(16,17,20,.16)" }}
          >
            <svg viewBox="0 0 24 24" style={{ height: 20, width: 20, flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>
        </div>
        <p className="text-center mt-5" style={{ fontSize: 11.5, color: "#B0ADA5", lineHeight: 1.6 }}>
          Restricted to <span style={{ fontFamily: "var(--font-mono)" }}>@sjprep.org</span> and{" "}
          <span style={{ fontFamily: "var(--font-mono)" }}>@sjprephawks.org</span>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FCFAF6 0%, #F5EFE7 100%)" }} />}>
      <SignInContent />
    </Suspense>
  );
}
