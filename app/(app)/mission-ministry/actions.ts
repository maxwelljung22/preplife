"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessMissionMinistry } from "@/lib/roles";
import {
  normalizeHttpsUrl,
  normalizeMultilineText,
  normalizePlainText,
  normalizeThemeColor,
} from "@/lib/sanitize";

async function requireUser() {
  const session = await auth();
  return session?.user ?? null;
}

type MinistryProgramInput = {
  title: string;
  summary: string;
  description: string;
  type: "SERVICE_OPPORTUNITY" | "KAIROS" | "RETREAT";
  location: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  capacity?: number | string;
  isFeatured?: boolean;
  colorFrom?: string;
  colorTo?: string;
  imageUrl?: string;
};

function parseDateTime(value: string, label: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: `Add a valid ${label}.` } as const;
  }
  return { value: parsed } as const;
}

export async function createMinistryProgram(input: MinistryProgramInput) {
  const user = await requireUser();
  if (!user) return { error: "You need to sign in first." };
  if (!canAccessMissionMinistry(user.role)) {
    return { error: "Only Mission & Ministry staff or admins can publish these programs." };
  }

  const title = normalizePlainText(input.title, { maxLength: 120 });
  const summary = normalizePlainText(input.summary, { maxLength: 180 });
  const description = normalizeMultilineText(input.description, { maxLength: 5000 });
  const location = normalizePlainText(input.location, { maxLength: 120 });
  const startDate = parseDateTime(input.startDate, "start date");
  const endDate = parseDateTime(input.endDate, "end date");

  if ("error" in startDate) return startDate;
  if ("error" in endDate) return endDate;
  if (!title || !summary || !description || !location) {
    return { error: "Fill out the title, summary, description, and location first." };
  }
  if (endDate.value < startDate.value) {
    return { error: "The end time has to be after the start time." };
  }

  let registrationDeadline: Date | null = null;
  if (input.registrationDeadline) {
    const parsedDeadline = parseDateTime(input.registrationDeadline, "registration deadline");
    if ("error" in parsedDeadline) return parsedDeadline;
    registrationDeadline = parsedDeadline.value;
  }

  const capacity =
    input.capacity === "" || input.capacity === undefined || input.capacity === null
      ? null
      : Math.max(1, Math.min(500, Number(input.capacity)));
  const colorFrom = normalizeThemeColor(input.colorFrom) ?? "#8B1A1A";
  const colorTo = normalizeThemeColor(input.colorTo) ?? "#D97706";
  const imageUrl = normalizeHttpsUrl(input.imageUrl) ?? null;

  const program = await prisma.ministryProgram.create({
    data: {
      title,
      summary,
      description,
      type: input.type,
      location,
      startDate: startDate.value,
      endDate: endDate.value,
      registrationDeadline,
      capacity: Number.isFinite(capacity as number) ? capacity : null,
      isFeatured: Boolean(input.isFeatured),
      registrationOpen: true,
      colorFrom,
      colorTo,
      imageUrl,
      createdById: user.id,
    },
  });

  revalidatePath("/mission-ministry");
  revalidatePath("/dashboard");

  return { success: true, program };
}

export async function deleteMinistryProgram(programId: string) {
  const user = await requireUser();
  if (!user) return { error: "You need to sign in first." };
  if (!canAccessMissionMinistry(user.role)) {
    return { error: "Only Mission & Ministry staff or admins can remove programs." };
  }

  await prisma.ministryProgram.delete({
    where: { id: programId },
  });

  revalidatePath("/mission-ministry");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function toggleMinistryProgramRegistration(programId: string, registrationOpen: boolean) {
  const user = await requireUser();
  if (!user) return { error: "You need to sign in first." };
  if (!canAccessMissionMinistry(user.role)) {
    return { error: "Only Mission & Ministry staff or admins can change registration state." };
  }

  await prisma.ministryProgram.update({
    where: { id: programId },
    data: { registrationOpen },
  });

  revalidatePath("/mission-ministry");
  return { success: true };
}

export async function toggleMinistrySignup(programId: string) {
  const user = await requireUser();
  if (!user) return { error: "You need to sign in first." };

  const program = await prisma.ministryProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      title: true,
      registrationOpen: true,
      registrationDeadline: true,
      capacity: true,
      _count: {
        select: { signups: true },
      },
      signups: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  });

  if (!program) return { error: "Program not found." };

  const existingSignup = program.signups[0];
  if (existingSignup) {
    await prisma.ministrySignup.delete({
      where: { id: existingSignup.id },
    });

    revalidatePath("/mission-ministry");
    return { success: true, action: "removed", title: program.title };
  }

  if (!program.registrationOpen) {
    return { error: "Registration is closed for this program." };
  }
  if (program.registrationDeadline && program.registrationDeadline < new Date()) {
    return { error: "Registration has already closed for this program." };
  }
  if (program.capacity && program._count.signups >= program.capacity) {
    return { error: "This program is already full." };
  }

  await prisma.ministrySignup.create({
    data: {
      programId,
      userId: user.id,
    },
  });

  revalidatePath("/mission-ministry");
  return { success: true, action: "added", title: program.title };
}
