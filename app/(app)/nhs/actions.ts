// app/(app)/nhs/actions.ts
"use server";

import { auth } from "@/auth";
import { syncNhsNow } from "@/lib/airtable";
import { revalidatePath } from "next/cache";

export async function syncNhs() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const result = await syncNhsNow();
  revalidatePath("/nhs");
  revalidatePath("/dashboard");
  return result;
}
