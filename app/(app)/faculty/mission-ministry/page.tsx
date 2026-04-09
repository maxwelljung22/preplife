import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { canAccessMissionMinistry } from "@/lib/roles";
import { MinistryPublisher } from "@/components/mission-ministry/ministry-publisher";

export const metadata = { title: "Mission & Ministry Staff" };
export const dynamic = "force-dynamic";

export default async function FacultyMissionMinistryPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");
  if (!canAccessMissionMinistry(session.user.role)) redirect("/faculty?error=unauthorized");

  const programs = await prisma.ministryProgram.findMany({
    orderBy: [{ isFeatured: "desc" }, { startDate: "asc" }],
    include: {
      _count: {
        select: { signups: true },
      },
    },
  });

  return (
    <MinistryPublisher
      programs={programs.map((program) => ({
        id: program.id,
        title: program.title,
        summary: program.summary,
        type: program.type,
        location: program.location,
        startDate: program.startDate.toISOString(),
        endDate: program.endDate.toISOString(),
        registrationDeadline: program.registrationDeadline ? program.registrationDeadline.toISOString() : null,
        capacity: program.capacity,
        signupCount: program._count.signups,
        registrationOpen: program.registrationOpen,
        isFeatured: program.isFeatured,
        colorFrom: program.colorFrom,
        colorTo: program.colorTo,
      }))}
    />
  );
}
