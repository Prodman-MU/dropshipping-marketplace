/**
 * @file prisma.config.ts
 * @description Prisma 7 Configuration & CLI Datasource Definition.
 * 
 * In Prisma 7, connection URLs for database migrations and CLI operations are configured
 * here rather than inside schema.prisma. Automatically loads environment variables via dotenv
 * and routes migrations through DIRECT_URL (session connection on port 5432 / 54322) or
 * DATABASE_URL (Supavisor pooler on port 6543).
 */

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Path to the primary Prisma schema file
  schema: "prisma/schema.prisma",
  // Datasource configuration used by Prisma CLI commands (migrate, db push, studio)
  datasource: {
    url:
      process.env.DIRECT_URL ||
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
});
