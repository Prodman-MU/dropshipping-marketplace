/**
 * @file prisma.ts
 * @description Prisma Client Singleton Configuration for Next.js 16 & Prisma 7.
 * 
 * In Next.js development mode, Hot Module Replacement (HMR) repeatedly re-executes
 * module code. To prevent exhausting database connections by creating multiple
 * PrismaClient instances on every reload, we attach the client instance to `globalThis`.
 * 
 * Uses the modern `@prisma/adapter-pg` driver adapter required by Prisma 7 for
 * native PostgreSQL connections and Supabase Supavisor connection pooling.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Attach Prisma to the NodeJS / browser global context to persist across HMR reloads
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Initializes a new PrismaClient with the PostgreSQL driver adapter.
 * Fallbacks to the local Supabase PostgreSQL port (54322) if DATABASE_URL is not set.
 */
function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

/**
 * Global singleton Prisma client instance used for all database queries and transactions.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Save client instance on globalThis in non-production environments
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
