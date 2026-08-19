# Supabase, Prisma 7 & Next.js 16 Production Architecture: Findings & Learnings

---

## 1. Executive Summary

This document captures the end-to-end technical findings, architectural decisions, and production deployment gotchas encountered while integrating **Supabase (PostgreSQL, Auth, Storage)** and **Prisma ORM 7** into a **Next.js 16 (App Router)** marketplace application.

---

## 2. Key Architectural Decisions

### A. Supabase vs. Alembic: The Tech Stack Decision
* **The Confusion**: Choosing between Supabase and Alembic is comparing infrastructure with an ORM tool.
  * **Alembic** is a Python-specific migration engine for SQLAlchemy.
  * **Supabase** is a cloud Backend-as-a-Service (BaaS) providing hosted PostgreSQL, GoTrue Auth, and S3 Storage.
* **The Decision**: For a **Next.js 16 + TypeScript** stack, **Supabase + Prisma ORM 7** is the native fit. It provides a hosted database with serverless connection pooling while keeping 100% type-safe migrations and queries in TypeScript.

### B. Dual-Mode Local vs. Cloud Development
* **Local Development**: Managed via Supabase CLI (`npx supabase start`).
  * Runs an offline Docker stack on non-conflicting ports:
    * PostgreSQL: `127.0.0.1:54322`
    * API Gateway & Auth: `http://127.0.0.1:54321`
    * Supabase Studio Table Editor: `http://127.0.0.1:54323`
    * Inbucket Mailbox (Magic links/OTP): `http://127.0.0.1:54324`
* **Cloud Deployment**: Hosted on Supabase Cloud + Vercel.
  * Runtime queries use Supavisor Transaction Pooler (`DATABASE_URL` on port `6543`).
  * Schema migrations use Direct Session Connection (`DIRECT_URL` on port `5432`).

---

## 3. Prisma 7 Breaking Changes & Driver Adapters

### A. Datasource URLs Moved Out of `schema.prisma`
In Prisma 7, `url` and `directUrl` properties inside `schema.prisma`'s `datasource db` block are deprecated:
```prisma
// ❌ Deprecated in Prisma 7
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ✅ Correct Prisma 7 schema
datasource db {
  provider = "postgresql"
}
```
Connection URLs are now defined in `prisma.config.ts`:
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
});
```

### B. Mandatory Driver Adapter (`@prisma/adapter-pg`)
Prisma 7 requires an explicit database driver adapter for direct connection instantiations:
```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
```

---

## 4. Seeding Strategy: Local vs. Production

### The Problem:
Running full seed scripts in production can insert dummy/test products and fake merchants into real customer databases. Conversely, not seeding at all leaves critical configuration tables (like `site_settings`) empty, causing UI layout crashes.

### The Solution: Decoupled Seeding
1. **Shared Configuration Seeder (`prisma/seed-settings.ts`)**:
   - Upserts the baseline `site_settings` row (Dropshipping Year, Site Title, Announcement Ticker).
   - Idempotent: Skips if the default row already exists without overwriting admin modifications.
2. **Local Development Seeder (`prisma/seed.ts` via `npm run db:seed`)**:
   - Calls `seedSiteSettings()` **+** inserts mock merchants (Apex Gear, Threads & Co, Tech Vault) and 3 sample catalog products with inventory.
3. **Production Seeder (`prisma/seed-prod.ts` via `npm run db:seed:prod`)**:
   - Calls **only** `seedSiteSettings()`, leaving `merchants`, `listings`, and `inventory` clean for real Shopify integrations.

---

## 5. Production Deployment (Vercel & CI/CD) Pipeline Learnings

### The Error Encountered:
```
PrismaClientKnownRequestError: The table `public.site_settings` does not exist in the current database.
```

### Root Cause:
The build script was running `seed-prod.ts` before the tables had been created in Supabase Cloud. When deploying to a brand-new cloud database, the SQL migrations have not yet been applied.

### The Resolution:
Update the build pipeline in `package.json` to execute migrations before seeding:
```json
"scripts": {
  "build": "prisma generate && prisma migrate deploy && tsx prisma/seed-prod.ts && next build"
}
```

### Build Pipeline Lifecycle:
1. `prisma generate`: Generates TypeScript Prisma Client types.
2. `prisma migrate deploy`: Runs pending SQL migration files against Supabase Cloud (using `DIRECT_URL` on port 5432), creating all tables (`merchants`, `listings`, `inventory`, `site_settings`, `sync_logs`).
3. `tsx prisma/seed-prod.ts`: Safely upserts the single default `site_settings` row.
4. `next build`: Statically compiles and builds the Next.js App Router application.

---

## 6. Environment Variable Matrix Reference

| Variable | Local Development (.env) | Vercel Production Environment |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` | `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` | `https://[ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Local Anon JWT Key)* | *(Supabase Cloud Project Anon Key)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Local Service Role JWT Key)* | *(Supabase Cloud Project Service Role Key)* |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://your-custom-domain.com` |
| `ADMIN_PASSCODE` | `admin123` | *(Secure custom admin passcode)* |
| `MASTER_VENDOR_PASSCODE`| `vendor123` | *(Secure custom vendor passcode)* |
