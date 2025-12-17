import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function getPrisma(): PrismaClient {
  if (global.__prisma) return global.__prisma;

  const url = process.env.DATABASE_URL;
  if (!url) {
    // OJO: esto solo debe pasar si alguien llama getPrisma() en build.
    // Por eso, NO LLAMAR getPrisma() en top-level.
    throw new Error("DATABASE_URL is missing. Prisma cannot initialize.");
  }

  global.__prisma = new PrismaClient({
    datasourceUrl: url,
  });

  return global.__prisma;
}