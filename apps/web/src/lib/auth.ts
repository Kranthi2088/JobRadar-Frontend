import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@jobradar/db";

// Accept common typo / alternate casing from .env files
const devLocalEnabled =
  process.env.ENABLE_DEV_LOCAL_AUTH === "true" ||
  process.env.enableDevLocalAuth === "true";

function buildProviders() {
  const list = [];

  list.push(
    CredentialsProvider({
      id: "email-password",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    })
  );

  if (devLocalEnabled) {
    list.push(
      CredentialsProvider({
        id: "dev-local",
        name: "Local dev",
        credentials: {
          email: { label: "Email", type: "email" },
          name: { label: "Display name", type: "text" },
          secret: { label: "Dev secret", type: "password" },
        },
        async authorize(credentials) {
          const requiredSecret = process.env.DEV_LOCAL_AUTH_SECRET;
          if (requiredSecret && credentials?.secret !== requiredSecret) {
            return null;
          }

          const email = credentials?.email?.trim().toLowerCase();
          const name =
            credentials?.name?.trim() || email?.split("@")[0] || "Local dev";

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return null;
          }

          const user = await prisma.user.upsert({
            where: { email },
            create: {
              email,
              name,
              emailVerified: new Date(),
            },
            update: { name },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      })
    );
  }

  return list;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: buildProviders(),
  callbacks: {
    jwt: async ({ token, user }): Promise<JWT> => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const userId = token.sub;
      if (session.user && userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, plan: true },
        });
        if (dbUser) {
          (session.user as { id: string; plan: string }).id = dbUser.id;
          (session.user as { id: string; plan: string }).plan = dbUser.plan;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/onboarding",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
};
