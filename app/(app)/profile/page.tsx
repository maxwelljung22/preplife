// app/(app)/profile/page.tsx
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./profile-client";
import { getSession } from "@/lib/session";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) return null;

  const [user, memberships] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true, grade: true, bio: true, createdAt: true },
    }),
    prisma.membership.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      include: { club: { select: { id: true, name: true, emoji: true, slug: true, category: true, gradientFrom: true, gradientTo: true } } },
    }),
  ]);

  return <ProfileClient user={user as any} memberships={memberships as any} />;
}
