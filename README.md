# Masters' Union Shopify Multi-Vendor Marketplace

> High-performance, pure obsidian dark-mode marketplace platform with Cyber Gold accents and an ambient video canvas. Aggregates and lists products/assets from multiple connected Shopify stores via Shopify Storefront GraphQL & Admin APIs.

![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Animation-Framer%20Motion-purple?style=flat-square)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)
![Shopify](https://img.shields.io/badge/Integration-Shopify%20GraphQL-96BF48?style=flat-square&logo=shopify)

---

## ⚡ Key Features

- 🖤 **Pure Black & Cyber Gold Aesthetic**: High-contrast pure black `#000000` background, glassmorphic card containers (`#121216`), and vibrant `#FFE082` product grid container styling.
- 🎬 **Contained Hero Video Canvas**: Contained video hero card (`Hero.tsx` & `BackgroundVideo.tsx`) showcasing clean ambient video (`/assets/masters_union_dropshipping_v1.mp4`) with floating ON/OFF toggle and play/pause controls.
- 🖼️ **Animated GIF Logo**: Clickable header logo and product popup drawer header logo (`/assets/logoanimationblack.gif`) for instant Masters Union branding.
- 📦 **"Dropshipped Products" Section**: Dedicated section header block introducing verified inventory & real-time webhook synchronized products from active Shopify storefronts.
- 🔍 **Left Filter Sidebar Pane**: Sticky vertical left sidebar filter (`VendorFilterBar.tsx`) with catalog search, category dropdown filter, vendor store dropdown selector, and sort controls.
- 📱 **3-Tab Framer Motion Detail Drawer**: Slide-out drawer (`Product Specs`, `Shopify & Inventory GIDs`, `Webhook Sync Logs`) featuring Masters Union logo, vendor store backdrop popout, and direct buyer storefront checkout.
- 🔐 **Shopify OAuth 2.0 & Real-Time Webhooks**: Complete OAuth flow (`/api/shopify/auth` & `/api/shopify/callback`), HMAC SHA256 signature verification, admin moderation protocol, and automated catalog re-syncing (`/api/shopify/sync`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components, TypeScript)
- **Styling**: Tailwind CSS + Framer Motion + Lucide Icons
- **Database & ORM**: PostgreSQL managed via Prisma ORM (`Merchant`, `Listing`, `SyncLog`)
- **API Integration**: Shopify Storefront GraphQL API & Admin REST/GraphQL APIs
- **Development Fallback**: Built-in mock dataset loader (`data/mock-slots.ts`) for offline testing

---

## 📂 Custom Asset Placement Guide

Place your custom media assets inside the `public/assets/` directory:

| Asset Name | Target Location | Description |
|---|---|---|
| `masters_union_dropshipping_v1.mp4` | `public/assets/masters_union_dropshipping_v1.mp4` | Scrollable ambient background video |
| `logoanimationblack.gif` | `public/assets/logoanimationblack.gif` | Animated black header logo |

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- **Node.js**: v18.17.0 or higher
- **PostgreSQL**: Local Postgres, Supabase, or Neon database instance

### 2. Clone & Install

```bash
git clone https://github.com/your-username/dropshipping-marketplace.git
cd dropshipping-marketplace
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/dropshipping_db?schema=public"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Shopify Storefront Credentials (Optional - Mock fallback enabled if omitted)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="apex-gear.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN="your_storefront_token"

# Shopify Partner App OAuth & Webhook Credentials
SHOPIFY_CLIENT_ID="your_shopify_client_id"
SHOPIFY_CLIENT_SECRET="your_shopify_client_secret"
SHOPIFY_WEBHOOK_SECRET="your_shopify_webhook_secret"
```

### 4. Database Setup & Migrations

```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the marketplace.

---

## 📚 Complete Technical Documentation (`docs/`)

Explore the dedicated documentation guides inside the [`docs/`](./docs) folder:

1. 🚀 [**Getting Started Guide**](./docs/GETTING_STARTED.md)
2. 🏛️ [**System Architecture & Technical Specifications**](./docs/ARCHITECTURE.md)
3. 🔑 [**Shopify API & Webhook Integration Deep-Dive**](./docs/SHOPIFY_INTEGRATION.md)
4. 📡 [**API Endpoint Reference Manual**](./docs/API_REFERENCE.md)
5. 🎨 [**Design System Specification**](./docs/DESIGN_SYSTEM.md)

---

## 📄 License

MIT © 2026 Masters' Union Engine
