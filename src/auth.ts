import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        if (!email) {
          return null; 
        }

        try {
          // Busca al usuario en tu base de datos local
          let user = await prisma.user.findUnique({ where: { email } });

          // Si el usuario NO existe, lo crea.
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: email,
                name: email.split('@')[0], // Usa el inicio del email como nombre por defecto
              },
            });
          }
          
          // Ahora, con el usuario encontrado o creado, lo devuelve para iniciar la sesión.
          // Ya no comprobamos la contraseña aquí, porque Firebase ya lo hizo.
          return { id: user.id, email: user.email, name: (user as any)?.name ?? null };

        } catch (error) {
            console.error("Error en authorize:", error);
            return null; // Si hay algún error en la base de datos, no permite el login.
        }
      },
    }),
  ],

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
};

export default NextAuth(authOptions);
