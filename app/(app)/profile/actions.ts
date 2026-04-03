// app/(app)/profile/actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { bio?: string; grade?: number }) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio:   data.bio?.trim() || null,
        grade: data.grade ?? null,
      },
    });
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to update profile" };
  }
}
