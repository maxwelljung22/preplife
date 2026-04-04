"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessFacultyTools } from "@/lib/roles";
import type { EventType } from "@prisma/client";

type SchoolEventInput = {
  title: string;
  description?: string;
  location?: string;
  type: EventType;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
};

async function requireFacultyUser() {
  const session = await auth();
  if (!session?.user) return { error: "You need to sign in first." as const };
  if (!canAccessFacultyTools(session.user.role)) {
    return { error: "Only faculty and admins can manage school calendar events." as const };
  }

  return { user: session.user };
}

function normalizeEventInput(input: SchoolEventInput) {
  const title = input.title.trim().replace(/\s+/g, " ");
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  if (!title) return { error: "Add an event title." as const };
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return { error: "Enter a valid start and end time." as const };
  }
  if (endTime <= startTime) {
    return { error: "The end time must be after the start time." as const };
  }

  return {
    data: {
      title,
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      type: input.type,
      startTime,
      endTime,
      isAllDay: Boolean(input.isAllDay),
      isPublic: true,
      clubId: null,
    },
  };
}

export async function createSchoolEvent(input: SchoolEventInput) {
  const authResult = await requireFacultyUser();
  if ("error" in authResult) return authResult;

  const parsed = normalizeEventInput(input);
  if ("error" in parsed) return parsed;

  try {
    const event = await prisma.event.create({
      data: parsed.data,
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error) {
    console.error("[createSchoolEvent]", error);
    return { error: "Couldn't create that school calendar event." };
  }
}

export async function updateSchoolEvent(eventId: string, input: SchoolEventInput) {
  const authResult = await requireFacultyUser();
  if ("error" in authResult) return authResult;

  const parsed = normalizeEventInput(input);
  if ("error" in parsed) return parsed;

  try {
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, clubId: true },
    });

    if (!existing) return { error: "Event not found." };
    if (existing.clubId) return { error: "Club events should be managed from the club page." };

    const event = await prisma.event.update({
      where: { id: eventId },
      data: parsed.data,
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error) {
    console.error("[updateSchoolEvent]", error);
    return { error: "Couldn't update that school calendar event." };
  }
}

export async function deleteSchoolEvent(eventId: string) {
  const authResult = await requireFacultyUser();
  if ("error" in authResult) return authResult;

  try {
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, clubId: true, title: true },
    });

    if (!existing) return { error: "Event not found." };
    if (existing.clubId) return { error: "Club events should be managed from the club page." };

    await prisma.event.delete({
      where: { id: eventId },
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true, title: existing.title };
  } catch (error) {
    console.error("[deleteSchoolEvent]", error);
    return { error: "Couldn't delete that school calendar event." };
  }
}
