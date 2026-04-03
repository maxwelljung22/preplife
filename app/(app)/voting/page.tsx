// app/(app)/voting/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VotingClient } from "./voting-client";

export const metadata = { title: "Polls & Elections" };
export const dynamic = "force-dynamic";

export default async function VotingPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [polls, userVotes] = await Promise.all([
    prisma.poll.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      include: {
        club: { select: { name: true, emoji: true, slug: true } },
        options: {
          orderBy: { order: "asc" },
          include: { _count: { select: { votes: true } } },
        },
        _count: { select: { votes: true } },
      },
    }),
    prisma.vote.findMany({
      where: { userId: session.user.id },
      select: { pollId: true, optionId: true },
    }),
  ]);

  // Seed sample polls if empty
  if (polls.length === 0) {
    const sga = await prisma.poll.create({
      data: {
        createdById: session.user.id,
        title: "SGA Spring Dance Theme",
        description: "Vote for the Spring Formal theme. Results will be announced Friday.",
        visibility: "ANONYMOUS",
        isActive: true,
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        options: {
          create: [
            { text: "Midnight in Paris", order: 0 },
            { text: "Enchanted Garden", order: 1 },
            { text: "Roaring '20s Gala", order: 2 },
          ],
        },
      },
      include: {
        club: { select: { name: true, emoji: true, slug: true } },
        options: { orderBy: { order: "asc" }, include: { _count: { select: { votes: true } } } },
        _count: { select: { votes: true } },
      },
    });

    return (
      <VotingClient
        polls={[sga] as any}
        userVotes={{}}
        userId={session.user.id}
        isAdmin={session.user.role === "ADMIN"}
      />
    );
  }

  const votesMap = Object.fromEntries(userVotes.map((v) => [v.pollId, v.optionId]));

  return (
    <VotingClient
      polls={polls as any}
      userVotes={votesMap}
      userId={session.user.id}
      isAdmin={session.user.role === "ADMIN"}
    />
  );
}
