// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getAuthEnv } from "@/lib/env";
import type { UserRole } from "@prisma/client";

const authEnv = getAuthEnv();

const DOMAIN_ROLES: Record<string, UserRole> = {
  "sjprep.org": "ADMIN",
  "sjprephawks.org": "STUDENT",
};

function getRoleFromEmail(email: string): UserRole | null {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? (DOMAIN_ROLES[domain] ?? null) : null;
}

function isAllowedEmail(email: string): boolean {
  return getRoleFromEmail(email) !== null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: authEnv.googleClientId,
      clientSecret: authEnv.googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (!isAllowedEmail(user.email)) {
        return "/auth/error?error=DomainNotAllowed";
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        const role = getRoleFromEmail(user.email);
        token.role = role;
        token.userId = user.id;
      }
      if (trigger === "update" && token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId as string },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email || !user.id) return;
      const role = getRoleFromEmail(user.email);
      if (role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role },
        }).catch(() => {});
      }
    },
    async signIn({ user }) {
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      }).catch(() => {});
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    userId?: string;
  }
}
