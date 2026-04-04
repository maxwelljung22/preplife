// app/(app)/clubs/[slug]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClubDetailClient } from "./club-detail-client";
import { getSession } from "@/lib/session";
import { canManageClubMembershipRole } from "@/lib/roles";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

async function getClubData(slug: string, userId: string) {
  const club = await prisma.club.findUnique({
      where: { slug, isActive: true },
      include: {
        _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
        memberships: {
          where: { status: "ACTIVE" },
          include: { user: { select: { id: true, name: true, email: true, image: true, grade: true } } },
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { author: { select: { name: true, image: true } } },
        },
        events: {
          where: { startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
          take: 10,
        },
        resources: {
          orderBy: { createdAt: "desc" },
        },
        applications: userId
          ? {
              where: { applicantId: userId },
              select: { id: true, status: true, createdAt: true },
            }
          : undefined,
        appForm: true,
        polls: {
          where: { isActive: true },
          include: {
            options: { include: { _count: { select: { votes: true } } } },
            _count: { select: { votes: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

  if (!club) return null;

  const membership = await prisma.membership.findUnique({
    where: { userId_clubId: { userId, clubId: club.id } },
    select: { status: true, role: true },
  });

  // Fetch user's votes for polls in this club
  const pollIds = club.polls.map((p) => p.id);
  const userVotes = pollIds.length > 0
    ? await prisma.vote.findMany({
        where: { userId, pollId: { in: pollIds } },
        select: { pollId: true, optionId: true },
      })
    : [];

  const memberUserIds = club.memberships.map((membership) => membership.userId);
  const attendanceRecords = memberUserIds.length
    ? await prisma.attendanceRecord.findMany({
        where: {
          userId: { in: memberUserIds },
          session: { clubId: club.id },
        },
        orderBy: { joinedAt: "desc" },
        select: {
          userId: true,
          status: true,
          joinedAt: true,
          checkIn: true,
          session: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
      })
    : [];

  const attendanceByUser = Object.fromEntries(
    memberUserIds.map((memberId) => {
      const records = attendanceRecords.filter((record) => record.userId === memberId);
      return [
        memberId,
        {
          total: records.length,
          present: records.filter((record) => record.status === "PRESENT").length,
          late: records.filter((record) => record.status === "LATE").length,
          joined: records.filter((record) => record.status === "JOINED").length,
          recent: records.slice(0, 6),
        },
      ];
    })
  );

  return {
    club,
    membership,
    userVotes: Object.fromEntries(userVotes.map((v) => [v.pollId, v.optionId])),
    isLeader: canManageClubMembershipRole(membership?.role),
    attendanceByUser,
  };
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const club = await prisma.club.findUnique({ where: { slug }, select: { name: true, tagline: true } });
  return { title: club ? `${club.name} — Clubs` : "Club Not Found" };
}

export default async function ClubDetailPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session?.user) return null;

  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const data = await getClubData(slug, session.user.id);
  if (!data) notFound();

  return (
    <ClubDetailClient
      {...data}
      userId={session.user.id}
      userRole={session.user.role}
      defaultTab={resolvedSearchParams.tab ?? "overview"}
    />
  );
}
