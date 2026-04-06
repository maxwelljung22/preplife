"use client";

import { useRouter } from "next/navigation";
import { IntroSequence } from "@/components/intro/first-run-intro-gate";

export function IntroPreviewClient() {
  const router = useRouter();

  return (
    <IntroSequence
      onDismiss={() => router.push("/dashboard")}
      persistSeen={() => Promise.resolve()}
    />
  );
}

