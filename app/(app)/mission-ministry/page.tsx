import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MissionMinistryClient } from "@/components/mission-ministry/mission-ministry-client";
import { canAccessMissionMinistry } from "@/lib/roles";
import { fetchServiceOpportunityEvents } from "@/lib/signup-genius";

export const metadata = { title: "Mission & Ministry" };
export const dynamic = "force-dynamic";

export default async function MissionMinistryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const [programs, managers, serviceEvents] = await Promise.all([
    prisma.ministryProgram.findMany({
      orderBy: [{ isFeatured: "desc" }, { startDate: "asc" }],
      include: {
        createdBy: {
          select: { name: true },
        },
        signups: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
                graduationYear: true,
              },
            },
          },
        },
        _count: {
          select: { signups: true },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "MISSION_MINISTRY",
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: {
        name: true,
        email: true,
      },
    }),
    fetchServiceOpportunityEvents(),
  ]);

  return (
    <MissionMinistryClient
      canManage={canAccessMissionMinistry(session.user.role)}
      managerNames={managers.map((manager) => manager.name || manager.email || "Mission & Ministry")}
      serviceEvents={serviceEvents}
      programs={programs.map((program) => ({
        id: program.id,
        title: program.title,
        summary: program.summary,
        description: program.description,
        type: program.type,
        location: program.location,
        startDate: program.startDate.toISOString(),
        endDate: program.endDate.toISOString(),
        registrationDeadline: program.registrationDeadline ? program.registrationDeadline.toISOString() : null,
        capacity: program.capacity,
        isFeatured: program.isFeatured,
        registrationOpen: program.registrationOpen,
        colorFrom: program.colorFrom,
        colorTo: program.colorTo,
        imageUrl: program.imageUrl,
        createdByName: program.createdBy.name,
        signupCount: program._count.signups,
        signedUp: program.signups.some((signup) => signup.userId === session.user.id),
        signups: program.signups.map((signup) => ({
          id: signup.id,
          name: signup.user.name,
          email: signup.user.email,
          graduationYear: signup.user.graduationYear,
        })),
      }))}
    />
  );
}
