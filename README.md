# Masters' Union Shopify Multi-Vendor Dropshipping Marketplace

> Modern, high-performance B2B Multi-Vendor Dropshipping Marketplace platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma 7**, and **Supabase (PostgreSQL, Auth, Storage)**. Features a bold Bauhaus visual design system, real-time Shopify Storefront & Admin API integration, dedicated product detail pages, 2-column mobile optimization, dual local & cloud development workflows, and serverless connection pooling via Supabase Supavisor.

![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748?style=flat-square&logo=prisma)
![Supabase](https://img.shields.io/badge/Backend-Supabase%20(Postgres%20|%20Auth%20|%20Storage)-3ECF8E?style=flat-square&logo=supabase)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker)
![Shopify](https://img.shields.io/badge/Integration-Shopify%20GraphQL-96BF48?style=flat-square&logo=shopify)

---

## ⚡ Key Features & Capabilities

- 🎨 **Bauhaus Design System**: High-contrast, tactile UI featuring `#F4F4F0` light canvas, `#FFB703` Cyber Gold accents, `#111111` solid 2px/3px/4px borders, and hard offset block shadows (`shadow-[4px_4px_0px_#111111]`).
- 🛍️ **Dedicated Product Pages (`/product/[id]`)**: Full-page product view with multi-image gallery, variant selectors, wholesale pricing, pre-filled WhatsApp B2B inquiry CTA, direct Shopify checkout, copy specifications tool, and related products carousel.
- 📱 **Mobile Optimization**:
  - **2-Column Product Grid**: Responsive `grid-cols-2` layout on mobile screens with uniform image aspect ratios and consistent store name horizontal baseline alignment.
  - **Sticky Bottom Filter Bar**: Fixed bottom bar on mobile (`sticky bottom-0 z-40`) with 1-tap horizontal scrollable category pills and a slide-up filter sheet drawer.
- 💬 **WhatsApp B2B Inquiries**: 1-click WhatsApp click-to-chat CTA pre-loaded with vendor contact details, product title, SKU, price, and B2B dropshipping request terms.
- 🏷️ **Clean Inventory Statuses**: All numerical inventory unit counts are hidden across the application. High-contrast `OUT OF STOCK` tags are displayed next to the price only when a product or variant is unavailable.
- 🔒 **Supabase Auth & Session Management (`@supabase/ssr`)**: Cookie-based server-side authentication with automatic token refreshing via Next.js `middleware.ts`, supporting role-based access for Admins, Merchants, and Customers.
- 📦 **Supabase Storage Integration**: Dedicated public storage bucket (`marketplace-assets`) for uploading and serving merchant store logos and marketing banners, while preserving Shopify's global Edge CDN for product catalog images.
- ⚙️ **Admin Portal & Website Settings**: Admin dashboard (`/admin`) with store moderation tabs, link store workflow, and editable site settings (dropshipping year, site title, announcement text) with live preview.
- 🗄️ **Decoupled Catalog & Inventory Schema**: Prisma 7 models separating `Listing` (Catalog) and `Inventory` with `isUnknownQuantity` fallbacks and dynamic domain parsing (`getDomainCandidates`).
- 🐳 **Dual-Mode Infrastructure (Local & Cloud)**:
  - **Local Development**: Supabase CLI (`supabase start`) / Docker providing local Postgres (`:54322`), Studio Dashboard (`:54323`), and Inbucket Mailbox (`:54324`).
  - **Cloud Deployment**: Supabase Supavisor transaction pooler on port `6543` for serverless API routes + direct connection on port `5432` for Prisma schema migrations.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Components, Server Actions)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Framer Motion + Lucide Icons
- **Database & ORM**: PostgreSQL managed via Prisma ORM 7 (`prisma.config.ts`, `schema.prisma`)
- **Backend-as-a-Service**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`, Supabase Storage, GoTrue Auth)
- **Local Dev Stack**: Supabase CLI + Docker Compose (`postgres:16-alpine`)
- **API Integrations**: Shopify Storefront GraphQL API & Admin REST/GraphQL APIs
- **State Management**: Reactive Local Storage & Custom DOM Event Dispatchers

---

## 📂 Asset Placement Guide

Place your custom static media assets inside the `public/assets/` directory:

| Asset Name | Location | Description |
|---|---|---|
| `masters_union_dropshipping_v1.mp4` | `public/assets/masters_union_dropshipping_v1.mp4` | Hero section ambient background video |
| `logoanimationblack.gif` | `public/assets/logoanimationblack.gif` | Animated black header brand logo |

*Note: Merchant logos and promotional banners uploaded at runtime are stored in Supabase Storage (`marketplace-assets` bucket).*

---

## 🚀 Quick Start Guide

### 1. Local Development with Supabase CLI (Recommended)

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Start Local Supabase Stack (Requires Docker)
```bash
npx supabase start
```
This spins up the local Supabase containers:
- **API Gateway**: `http://127.0.0.1:54321`
- **PostgreSQL Database**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Studio Dashboard**: `http://127.0.0.1:54323`
- **Inbucket Mailbox**: `http://127.0.0.1:54324`

#### Step 3: Run Database Migrations & Seeding
```bash
# Push schema migrations to local Postgres
npx prisma migrate dev

# Seed initial catalog and settings
npm run db:seed
```

#### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Alternative: Local Docker Compose Setup

If you prefer using the pre-configured standalone PostgreSQL container:
```bash
docker-compose up --build
```
Access the application at [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deployment Guide (Vercel + Supabase Cloud)

### 1. Environment Variables Configuration

Configure the following environment variables in your hosting provider (e.g. Vercel):

```env
# ------------------------------------------------------------------------------
# Supabase Cloud Project Credentials
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"

# Supavisor Transaction Pooler (Port 6543) - For App Router serverless queries
DATABASE_URL="postgresql://postgres.<your-project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (Port 5432) - For Prisma CLI schema migrations
DIRECT_URL="postgresql://postgres.<your-project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# ------------------------------------------------------------------------------
# Application Base URL & Admin Passcodes
# ------------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
ADMIN_PASSCODE="your_secure_admin_passcode"
MASTER_VENDOR_PASSCODE="your_secure_vendor_passcode"

# ------------------------------------------------------------------------------
# Shopify Storefront & Admin API (Optional)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="apex-gear.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN="your_storefront_access_token"
SHOPIFY_CLIENT_ID="your_shopify_partner_app_api_key"
SHOPIFY_CLIENT_SECRET="your_shopify_partner_app_api_secret"
SHOPIFY_WEBHOOK_SECRET="your_shopify_webhook_hmac_secret"
```

### 2. Automated Build Pipeline

The repository build script automatically compiles the Prisma 7 client before executing Next.js static page compilation:

```json
"scripts": {
  "build": "prisma generate && npx tsx prisma/seed-prod.ts && next build",
  "postinstall": "prisma generate"
}
```

Deploying migrations to Supabase Cloud:
```bash
npx prisma migrate deploy
```

---

## 📚 Technical Documentation Suite

| Document | Description |
|---|---|
| 📖 [**Database & Auth Deep Dive**](./docs/DATABASE_AND_AUTH_DEEP_DIVE.md) | Foundational explainer on Supabase vs Alembic, SSR cookie auth, connection pooling, and storage |
| 🏛️ [**System Architecture**](./docs/ARCHITECTURE.md) | Event-driven architecture, Prisma 7 schema models, Supabase integration, and directory structure |
| 🚀 [**Getting Started Guide**](./docs/GETTING_STARTED.md) | Step-by-step local setup, Docker & Supabase CLI commands, environment variables, and ngrok webhooks |
| ✨ [**Project Features Catalog**](./docs/PROJECT_FEATURES.md) | Complete breakdown of UI components, Bauhaus design system, product detail pages, and admin tools |
| 🔑 [**Shopify API & Webhooks**](./docs/SHOPIFY_INTEGRATION.md) | Storefront GraphQL queries, OAuth 2.0 protocol, webhook pipeline, and HMAC validation |
| 📡 [**API Endpoint Reference**](./docs/API_REFERENCE.md) | HTTP methods, routes, headers, parameters, Supabase storage utilities, and sample JSON payloads |
| 🎨 [**Design System Specification**](./docs/DESIGN_SYSTEM.md) | Bauhaus visual design tokens, border weights, offset block shadow utilities, and color palettes |

---

## 📄 License

MIT © 2026 Masters' Union Engine
