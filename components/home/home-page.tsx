"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroPanel } from "./hero-panel";
import { AuthCard } from "./auth-card";

export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;
export const EASE_OUT    = [0.4, 0, 0.2, 1]      as const;

export type SignInState = "idle" | "loading" | "success" | "error";

export function HomePage() {
  const [signInState, setSignInState] = useState<SignInState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const shouldReduce = useReducedMotion();

  const handleSignIn = useCallback(async () => {
    if (signInState === "loading") return;
    setSignInState("loading");
    setErrorMessage("");
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });
      if (result?.error) {
        const msg =
          result.error === "DomainNotAllowed"
            ? "Only @sjprep.org and @sjprephawks.org accounts are allowed."
            : "Sign-in failed. Please try again.";
        setErrorMessage(msg);
        setSignInState("error");
        setTimeout(() => setSignInState("idle"), 4000);
      } else if (result?.url) {
        setSignInState("success");
        window.location.href = result.url;
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setSignInState("error");
      setTimeout(() => setSignInState("idle"), 4000);
    }
  }, [signInState]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: shouldReduce ? 0 : 0.3 } }}
      className="flex min-h-screen overflow-hidden"
    >
      <HeroPanel />
      <motion.section
        className="flex-1 flex items-center justify-center p-10 relative overflow-hidden"
        style={{ background: "#F8F6F1" }}
        initial={{ opacity: 0, x: shouldReduce ? 0 : 20 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
        aria-label="Sign in"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(139,15,15,.04) 0%, transparent 60%)," +
              "radial-gradient(ellipse 60% 80% at 80% 80%, rgba(12,24,36,.05) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />
        <AuthCard state={signInState} errorMessage={errorMessage} onSignIn={handleSignIn} />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1.1, duration: 0.5 } }}
          className="absolute bottom-7 left-10 right-10 flex items-center gap-3"
        >
          <div className="w-5 h-px" style={{ background: "#B0A898" }} />
          <p className="text-[13px] italic font-light tracking-wide" style={{ color: "#B0A898", fontFamily: "var(--font-display)" }}>
            &quot;Men for Others&quot; — St. Joseph&apos;s Preparatory, 1851
          </p>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
