import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
      // Al iniciar sesión, `user` contiene los datos de `authorize`
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.email = user.email;
        token.updatedAt = (user as any).updatedAt; // `user` ya tiene el timestamp
      }

      // Cuando la sesión se actualiza
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.image = dbUser.image;
          token.updatedAt = dbUser.updatedAt.getTime(); // Obtenemos el nuevo timestamp
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Pasamos los datos del token a la sesión del cliente
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.image as string | null;
        session.user.updatedAt = token.updatedAt as number | undefined;
      }
      
      return session;
    },
  },
};
