import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email o usuario", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!identifier || !password) {
          return null;
        }

        try {
          const normalized = identifier.toLowerCase();
          const isEmail = normalized.includes("@");
          const user = await prisma.user.findFirst({
            where: isEmail ? { email: normalized } : { username: normalized },
          });

          if (!user) {
            // Si no hay usuario, NextAuth no lo creará aquí.
            // El flujo de creación se maneja en otro lugar o se deniega el acceso.
            return null;
          }

          if (!user.password) {
            return null;
          }

          const passwordValid = await bcrypt.compare(password, user.password);
          if (!passwordValid) {
            return null;
          }
          
          // Devolvemos todos los datos del usuario que necesitaremos en el token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            // Convertimos la fecha a timestamp para usarla en la caché
            updatedAt: user.updatedAt.getTime(), 
          };

        } catch (error) {
            console.error("Error en authorize:", error);
            return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    }),
  ],
  
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, trigger, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // Strip large fields from the token to avoid oversized cookies.
      delete (token as any).name;
      delete (token as any).picture;
      delete (token as any).image;

      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { updatedAt: true },
        });
        if (dbUser) {
          token.updatedAt = dbUser.updatedAt.getTime();
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user || !token?.id) {
        return session;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, name: true, image: true, updatedAt: true },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.name = dbUser.name;
        session.user.image = dbUser.image as string | null;
        session.user.updatedAt = dbUser.updatedAt.getTime();
      }

      return session;
    },
  },
};
