import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * El objeto Session que se devuelve desde useSession, getSession y recibido como prop para el SessionProvider
   */
  interface Session {
    user: {
      /** El ID del usuario en la base de datos. */
      id: string;
      /** La marca de tiempo de la última actualización para invalidar la caché. */
      updatedAt?: number;
    } & DefaultSession["user"];
  }

  // Extendemos el objeto User para que coincida con nuestro modelo de Prisma
  interface User extends DefaultUser {
    id: string;
    updatedAt?: number; 
  }
}

declare module "next-auth/jwt" {
  /** Devuelto por el callback `jwt` y `getToken`, se encripta. */
  interface JWT extends DefaultJWT {
    /** El ID del usuario en la base de datos. */
    id: string;
    /** La marca de tiempo de la última actualización para invalidar la caché. */
    updatedAt?: number;
  }
}
