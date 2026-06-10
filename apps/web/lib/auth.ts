import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@hl/database";

import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          console.error("[auth] credentials missing");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            console.error("[auth] user not found:", email);
            return null;
          }

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) {
            console.error("[auth] invalid password for:", email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? "HL Operator",
          };
        } catch (error) {
          console.error("[auth] database error during login:", error);
          throw error;
        }
      },
    }),
  ],
});
