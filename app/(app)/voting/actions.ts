// app/(app)/voting/actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function castVoteAction(pollId: string, optionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  // Verify poll + option exist and poll is active
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: { isActive: true, endsAt: true, options: { select: { id: true } } },
  });

  if (!poll) return { error: "Poll not found" };
  if (!poll.isActive) return { error: "This poll is no longer active" };
  if (poll.endsAt && new Date() > new Date(poll.endsAt)) return { error: "This poll has ended" };
  if (!poll.options.some((o) => o.id === optionId)) return { error: "Invalid option" };

  // Check for existing vote
  const existing = await prisma.vote.findUnique({
    where: { pollId_userId: { pollId, userId: session.user.id } },
  });
  if (existing) return { error: "You have already voted in this poll" };

  try {
    await prisma.vote.create({
      data: { pollId, optionId, userId: session.user.id },
    });
    revalidatePath("/voting");
    return { success: true };
  } catch (err: any) {
    if (err.code === "P2002") return { error: "You have already voted" };
    console.error("[castVote]", err);
    return { error: "Failed to record your vote" };
  }
}
