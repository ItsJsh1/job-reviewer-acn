// Prisma client singleton. Only used once DATABASE_URL is set and you've
// run `npx prisma migrate dev` (see README, Stage 3). Until then the app
// runs on the in-memory store in lib/store.js.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
