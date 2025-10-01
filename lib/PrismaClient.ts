import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple PrismaClient instances in development
  var prisma: PrismaClient | undefined;
}

export const db =
  globalThis.prisma ||
  new PrismaClient({
    log: ["query"], // optional: logs queries in dev
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}
