import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

// ⚠️ Si estás en v4 y usas PrismaAdapter, normalmente es:
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// y luego adapter: PrismaAdapter(prisma)

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // actívalo cuando confirmes el adapter correcto

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        const hash =
          (user as any)?.passwordHash ??
          (user as any)?.hashedPassword ??
          (user as any)?.password;

        if (!user || !hash) return null;

        const ok = await bcrypt.compare(password, String(hash));
        if (!ok) return null;

        return { id: user.id, email: user.email, name: (user as any)?.name ?? null };
      },
    }),
  ],

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
