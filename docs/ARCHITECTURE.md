# System Architecture & Technical Specifications
### Masters' Union Shopify Multi-Vendor Dropshipping Marketplace

> **Dual-Perspective Architecture**: This document specifies the component hierarchy, data flow, serverless database pooling strategy, security boundaries, and streaming boundaries for both **Full-Stack Developers** maintaining the codebase and **AI Product Managers** evaluating system scalability.

---

## 🏗️ High-Level System Topology

```mermaid
flowchart TD
    subgraph Client["Client Layer (Next.js 16 App Router)"]
        Page["Marketplace Homepage (app/page.tsx)"]
        Sidebar["Left Filter Sidebar (VendorFilterBar)"]
        HeroCard["Contained Video Hero (Hero & BackgroundVideo)"]
        Grid["Product Grid Container (bg-[#FFE082])"]
        Drawer["Product Details Drawer (ListingDrawer)"]
        AdminPortal["Admin Moderation Desk (/admin)"]
        VendorPortal["Vendor Portal (/vendor)"]
    end

    subgraph Security["Auth & Guard Layer"]
        MW["Next.js Middleware & SSR Cookies"]
        PasscodeAuth["Store-Isolated Passcode Authenticator"]
        OTPAuth["10m Single-Use Admin Email OTP"]
        HMACGuard["Shopify Webhook Raw Stream HMAC Guard"]
    end

    subgraph Data["Persistence & ORM Layer (Prisma 7)"]
        PrismaAdapter["Prisma Client (@prisma/adapter-pg)"]
        Pooler["Supavisor Transaction Pooler (:6543)"]
        DirectSession["Direct Migration Session (:5432 / :54322)"]
    end

    subgraph Services["External & Cloud Backend Services"]
        SupabaseDB["Supabase Hosted PostgreSQL"]
        SupabaseStorage["Supabase S3 Storage (marketplace-assets)"]
        ShopifyAPI["Shopify Storefront & Admin APIs"]
    end

    Client --> Security
    Security --> Data
    Data --> Services
```

---

## 🗄️ Database Architecture & Serverless Connection Pooling

### Dual Connection URL Configuration (`prisma.config.ts`)

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

### Connection Strategy Breakdown

| Environment / Workload | Port | Driver Strategy | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Runtime Serverless API Queries** | `6543` | Supavisor / PgBouncer Pooler (`DATABASE_URL`) | Multiplexes transient serverless lambda connections, preventing database `max_connections` exhaustion during traffic spikes. |
| **CI/CD Schema Migrations** | `5432` / `54322` | Direct PostgreSQL Session (`DIRECT_URL`) | Required for DDL commands (`CREATE TABLE`, `ALTER TABLE`) and migration advisory locks (`prisma migrate deploy`). |
| **Local Development** | `54322` | Local Supabase Docker Postgres | Non-conflicting port isolated from native host PostgreSQL services running on default port `5432`. |

---

## 🌳 Component Hierarchy & Layout Tree

```
app/
 ├── layout.tsx                (Root Layout with Google Fonts & Toast Providers)
 ├── page.tsx                  (2-Column Layout: Left Sidebar + #FFE082 Product Grid)
 ├── admin/page.tsx            (Admin Moderation Portal & OTP Verification)
 ├── vendor/page.tsx           (Vendor Onboarding & Store-Isolated Slot Manager)
 ├── api/
 │    ├── auth/
 │    │    ├── admin/send-otp/route.ts   (Dispatches 6-digit OTP to Admin Email)
 │    │    ├── admin/verify-otp/route.ts (Verifies and invalidates OTP single-use)
 │    │    └── passcode/route.ts        (Store-isolated vendor authentication)
 │    ├── shopify/
 │    │    ├── connect/route.ts         (Ingests custom domains & upserts DB)
 │    │    └── sync/route.ts            (Store catalog synchronization)
 │    └── webhooks/
 │         └── shopify/route.ts         (Raw stream HMAC SHA-256 signature guard)
components/
 ├── BackgroundVideo.tsx       (Contained rounded video card with floating controls)
 ├── Hero.tsx                  (Hero section wrapper embedding BackgroundVideo)
 ├── VendorFilterBar.tsx       (Sticky vertical left sidebar with category <select>)
 ├── ListingCard.tsx           (Solid obsidian dark card with compare price & badges)
 ├── ListingDrawer.tsx         (Slide-over product drawer with Masters Union GIF logo)
 ├── AdminAdApproval.tsx       (Hero banner carousel moderation desk)
 └── StoreOnboardingModal.tsx  (Embedded Shopify store onboarding form)
```

---

## 🛡️ Multi-Tenant Security & Security Isolation

```mermaid
sequenceDiagram
    autonumber
    actor Vendor as Vendor User
    participant UI as /vendor Portal
    participant API as POST /api/auth/passcode
    participant DB as Prisma (merchants table)

    Vendor->>UI: Select Store & Enter Store Passcode
    UI->>API: { storeId: 'merchant_123', passcode: 'secret' }
    API->>DB: Fetch merchant by storeId
    DB-->>API: Returns merchant.vendorPasscode
    alt Passcode matches merchant.vendorPasscode OR MASTER_VENDOR_PASSCODE
        API-->>UI: { success: true, authorizedStoreId: 'merchant_123' }
        UI->>UI: Scope UI state strictly to merchant_123 listings
    else Passcode Mismatch
        API-->>UI: { success: false, error: 'Invalid store passcode' }
    end
```

1. **Store-Isolated Sessions**: Passcode authentication binds the session to `authorizedStoreId`.
2. **IDOR Protection**: API handlers reject state mutations if `authorizedStoreId !== listing.merchantId`.
3. **Master Fallback**: `MASTER_VENDOR_PASSCODE` acts as an emergency administrative override while preserving per-merchant credential privacy.
