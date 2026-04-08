// app/(app)/clubs/actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { canAccessAdmin } from "@/lib/roles";
import { isPrismaSchemaMismatchError } from "@/lib/prisma-errors";
import { normalizeHttpsUrl, normalizeMultilineText, normalizeSingleLineText, normalizeSlug, normalizeThemeColor } from "@/lib/sanitize";

export async function joinClub(clubId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  try {
    // Check club exists and is active
    const club = await prisma.club.findUnique({
      where: { id: clubId, isActive: true },
      select: { id: true, maxMembers: true, _count: { select: { memberships: { where: { status: "ACTIVE" } } } } },
    });
    if (!club) return { error: "Club not found" };

    // Check capacity
    if (club.maxMembers && club._count.memberships >= club.maxMembers) {
      return { error: "Club is at capacity" };
    }

    // Upsert membership
    await prisma.membership.upsert({
      where: { userId_clubId: { userId: session.user.id, clubId } },
      update: { status: "ACTIVE" },
      create: { userId: session.user.id, clubId, status: "ACTIVE", role: "MEMBER" },
    });

    revalidatePath("/clubs");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[joinClub]", err);
    return { error: "Failed to join club" };
  }
}

export async function leaveClub(clubId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  try {
    await prisma.membership.updateMany({
      where: { userId: session.user.id, clubId },
      data: { status: "INACTIVE" },
    });

    revalidatePath("/clubs");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[leaveClub]", err);
    return { error: "Failed to leave club" };
  }
}

export async function createClub(data: {
  name: string; slug?: string; logoUrl?: string; emoji: string; tagline: string; description: string;
  category: string; commitment: string; meetingDay: string; meetingTime: string;
  meetingRoom: string; requiresApp: boolean; tags: string[]; gradientFrom?: string; gradientTo?: string;
}) {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) return { error: "Unauthorized" };

  const gradientFrom = normalizeThemeColor(data.gradientFrom ?? "#1a3a6e");
  const gradientTo = normalizeThemeColor(data.gradientTo ?? "#0c2a52");
  if (!gradientFrom || !gradientTo) return { error: "Use valid hex colors for the club theme." };

  const slug = normalizeSlug(data.slug?.trim() || data.name);
  if (!slug) return { error: "Add a valid URL slug for the club." };
  const logoUrl = data.logoUrl ? normalizeHttpsUrl(data.logoUrl) : null;
  if (data.logoUrl && !logoUrl) return { error: "Use a valid https:// URL for the club logo." };

  try {
    const normalizedName = normalizeSingleLineText(data.name, { maxLength: 80 });
    const normalizedTagline = normalizeSingleLineText(data.tagline, { maxLength: 140 });
    const normalizedDescription = normalizeMultilineText(data.description, { maxLength: 4000 });
    const normalizedMeetingDay = normalizeSingleLineText(data.meetingDay, { maxLength: 40 });
    const normalizedMeetingTime = normalizeSingleLineText(data.meetingTime, { maxLength: 40 });
    const normalizedMeetingRoom = normalizeSingleLineText(data.meetingRoom, { maxLength: 80 });

    if (!normalizedName || !normalizedDescription) {
      return { error: "Add a club name and description first." };
    }

    const club = await prisma.club.create({
      data: {
        slug,
        name: normalizedName,
        emoji: data.emoji,
        description: normalizedDescription,
        category: data.category as any,
        commitment: data.commitment as any,
        requiresApp: data.requiresApp,
        tags: data.tags,
        gradientFrom,
        gradientTo,
        ...(logoUrl ? { logoUrl } : {}),
        ...(normalizedTagline ? { tagline: normalizedTagline } : {}),
        ...(normalizedMeetingDay ? { meetingDay: normalizedMeetingDay } : {}),
        ...(normalizedMeetingTime ? { meetingTime: normalizedMeetingTime } : {}),
        ...(normalizedMeetingRoom ? { meetingRoom: normalizedMeetingRoom } : {}),
      },
    });

    revalidatePath("/clubs");
    revalidatePath("/admin/clubs");
    return { success: true, slug: club.slug };
  } catch (err: any) {
    if (err.code === "P2002") return { error: "That club name or URL slug is already in use." };
    if (isPrismaSchemaMismatchError(err)) {
      return { error: "The club database schema is out of date. Apply the latest Prisma migrations, then try again." };
    }
    console.error("[createClub]", err);
    return { error: err?.message || "Failed to create club" };
  }
}

export async function updateClub(clubId: string, data: Partial<{
  name: string; slug: string; logoUrl: string | null; emoji: string; tagline: string; description: string;
  category: string; commitment: string; meetingDay: string; meetingTime: string;
  meetingRoom: string; requiresApp: boolean; tags: string[]; isActive: boolean; gradientFrom: string; gradientTo: string;
}>) {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) return { error: "Unauthorized" };

  try {
    const gradientFrom = data.gradientFrom ? normalizeThemeColor(data.gradientFrom) : undefined;
    const gradientTo = data.gradientTo ? normalizeThemeColor(data.gradientTo) : undefined;
    if (data.gradientFrom && !gradientFrom) return { error: "Use a valid hex color for the club theme." };
    if (data.gradientTo && !gradientTo) return { error: "Use a valid hex color for the club theme." };

    const slug = data.slug !== undefined
      ? normalizeSlug(data.slug)
      : data.name
        ? normalizeSlug(data.name)
        : undefined;
    if (data.slug !== undefined && !slug) return { error: "Add a valid URL slug for the club." };
    const logoUrl = data.logoUrl !== undefined
      ? data.logoUrl
        ? normalizeHttpsUrl(data.logoUrl)
        : null
      : undefined;
    if (data.logoUrl !== undefined && data.logoUrl && !logoUrl) {
      return { error: "Use a valid https:// URL for the club logo." };
    }

    const club = await prisma.club.update({
      where: { id: clubId },
      data: {
        ...(logoUrl !== undefined ? { logoUrl } : {}),
        ...(data.name ? { name: normalizeSingleLineText(data.name, { maxLength: 80 }) } : {}),
        ...(data.tagline !== undefined ? { tagline: normalizeSingleLineText(data.tagline, { maxLength: 140 }) } : {}),
        ...(data.description !== undefined ? { description: normalizeMultilineText(data.description, { maxLength: 4000 }) } : {}),
        ...(data.meetingDay !== undefined ? { meetingDay: normalizeSingleLineText(data.meetingDay, { maxLength: 40 }) } : {}),
        ...(data.meetingTime !== undefined ? { meetingTime: normalizeSingleLineText(data.meetingTime, { maxLength: 40 }) } : {}),
        ...(data.meetingRoom !== undefined ? { meetingRoom: normalizeSingleLineText(data.meetingRoom, { maxLength: 80 }) } : {}),
        ...(gradientFrom ? { gradientFrom } : {}),
        ...(gradientTo ? { gradientTo } : {}),
        ...(data.category !== undefined ? { category: data.category as any } : {}),
        ...(data.commitment !== undefined ? { commitment: data.commitment as any } : {}),
        ...(data.requiresApp !== undefined ? { requiresApp: data.requiresApp } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.emoji !== undefined ? { emoji: data.emoji } : {}),
        ...(slug ? { slug } : {}),
      },
    });
    revalidatePath("/clubs");
    revalidatePath("/admin/clubs");
    revalidatePath(`/clubs/${club.slug}`);
    return { success: true, slug: club.slug };
  } catch (err: any) {
    if (err.code === "P2002") return { error: "That club name or URL slug is already in use." };
    if (isPrismaSchemaMismatchError(err)) {
      return { error: "The club database schema is out of date. Apply the latest Prisma migrations, then try again." };
    }
    return { error: err?.message || "Failed to update club" };
  }
}

export async function deleteClub(clubId: string) {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) return { error: "Unauthorized" };

  try {
    // Soft delete
    await prisma.club.update({ where: { id: clubId }, data: { isActive: false } });
    revalidatePath("/clubs");
    revalidatePath("/admin/clubs");
    return { success: true };
  } catch (err) {
    return { error: "Failed to delete club" };
  }
}
