# Masters' Union Shopify Multi-Vendor Dropshipping Marketplace

> Modern, high-performance B2B Multi-Vendor Dropshipping Marketplace platform built with Next.js 16, TypeScript, Tailwind CSS, Prisma 7, and Docker. Features a bold Bauhaus visual design system, real-time Shopify Storefront & Admin API integration, dedicated product detail pages, 2-column mobile optimization, and cloud-ready database deployment with Supabase.

![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748?style=flat-square&logo=prisma)
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
- 🔝 **Header Navigation & Branding**: Sticky header with icon-only `<ArrowLeft />` back button when navigating product pages, animated logo GIF (`/assets/logoanimationblack.gif`), `/ DROPSHIPPING 2026` text badge, and live approved store/product counts.
- ⚙️ **Admin Portal & Website Settings**: Admin dashboard (`/admin`) with store moderation tabs, link store workflow, and editable site settings (dropshipping year, site title, announcement text) with live preview.
- 🗄️ **Decoupled Catalog & Inventory Schema**: Prisma 7 models separating `Listing` (Catalog) and `Inventory` with `isUnknownQuantity` fallbacks and dynamic domain parsing (`getDomainCandidates`).
- 🐳 **Docker & Cloud Architecture**: Local PostgreSQL development container (`docker-compose.yml`) + zero-downtime Supabase cloud database deployment via Vercel (`DATABASE_URL` transaction pooler on port 6543, `DIRECT_URL` session pooler on port 5432).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Framer Motion + Lucide Icons
- **Database & ORM**: PostgreSQL managed via Prisma ORM 7 (`prisma.config.ts`, `schema.prisma`)
- **Containerization**: Docker Compose (`postgres:16-alpine`, HMR watchpack polling)
- **API Integrations**: Shopify Storefront GraphQL API & Admin REST/GraphQL APIs
- **State Management**: Reactive Local Storage & Custom DOM Event Dispatchers

---

## 📂 Asset Placement Guide

Place your custom media assets inside the `public/assets/` directory:

| Asset Name | Location | Description |
|---|---|---|
| `masters_union_dropshipping_v1.mp4` | `public/assets/masters_union_dropshipping_v1.mp4` | Hero section ambient background video |
| `logoanimationblack.gif` | `public/assets/logoanimationblack.gif` | Animated black header brand logo |

---

## 🚀 Quick Start Guide

### 1. Local Docker Setup (Recommended)

Start the local PostgreSQL 16 database and Next.js development server with hot reloading:

```bash
docker-compose up --build
```

Access the application at [http://localhost:3000](http://localhost:3000).

### 2. Manual Local Setup

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```env
# Local Docker PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dropshipping_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/dropshipping_db?schema=public"

# Application Base URL & Credentials
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_PASSCODE="admin123"
MASTER_VENDOR_PASSCODE="vendor123"

# Shopify Credentials
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="apex-gear.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN="your_storefront_access_token"
```

#### Step 3: Database Migration & Seeding

```bash
# Generate Prisma 7 Client
npx prisma generate

# Push Schema to Postgres
npx prisma db push

# Seed Initial Catalog Data
npm run db:seed
```

#### Step 4: Run Development Server

```bash
npm run dev
```

---

## ☁️ Deployment Guide (Vercel + Supabase)

### 1. Database Connection Strings (Vercel Environment Variables)

Set the following environment variables in your Vercel project settings:

```env
# Transaction Pooler (Port 6543) - For App Router serverless API routes
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session Pooler (Port 5432) - For Prisma CLI migrations
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

ADMIN_PASSCODE="your_secure_admin_passcode"
MASTER_VENDOR_PASSCODE="your_secure_vendor_passcode"
```

### 2. Automated Build Pipeline

The repository build script automatically compiles the Prisma 7 client before executing Next.js static page compilation:

```json
"scripts": {
  "build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

---

## 📄 License

MIT © 2026 Masters' Union Engine
