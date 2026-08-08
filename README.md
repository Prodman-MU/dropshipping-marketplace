# DeLorean x Masters' Union Shopify Multi-Vendor Marketplace

> High-performance, obsidian dark-mode marketplace platform inspired by **DeLorean Marketplace** and **Masters' Union** design systems. Aggregates and lists products/assets from multiple connected Shopify stores via Shopify Storefront GraphQL & Admin APIs.

![Next.js](https://img.shields.io/badge/Framework-Next.js%2014-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Animation-Framer%20Motion-purple?style=flat-square)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)
![Shopify](https://img.shields.io/badge/Integration-Shopify%20GraphQL-96BF48?style=flat-square&logo=shopify)

---

## ⚡ Key Features

- 🌌 **High-Contrast DeLorean Obsidian Dark Theme**: Deep obsidian `#090A0F` background, glassmorphic card containers (`#13151D`), elevated surfaces (`#181A24`), and translucent borders (`border-white/10`).
- 🎬 **Scrollable Ambient Background Video**: Integrated high-tech dark video canvas with scroll-reactive opacity/parallax depth transitions and floating ON/OFF toggle controls.
- 📦 **Product-Centric Marketplace Grid**: High-density slot cards with monospaced technical metadata (`SLOT #001`, SKUs, Prices, Stock Levels, Shopify Product & Variant GIDs).
- 🔍 **Dedicated Product Search & Streamlined Filters**: Integrated product search bar (titles, SKUs, tags, slot numbers), category pills, vendor storefront dropdown, and sort controls.
- 📱 **Framer Motion Slide-Out Drawer**: 3-Tab detail drawer (`Product Specs`, `Shopify & Inventory GIDs`, `Webhook Sync Logs`) with direct buyer checkout link generation (`cartCreate` mutation).
- 🔐 **Shopify OAuth 2.0 & Webhook Pipeline**: Complete OAuth connection routes (`/api/shopify/auth` & `/api/shopify/callback`), HMAC SHA256 signature verification, and automated catalog re-syncing (`/api/shopify/sync`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router, Server Components, TypeScript)
- **Styling**: Tailwind CSS + Framer Motion + Lucide Icons
- **Database & ORM**: PostgreSQL managed via Prisma ORM (`Merchant`, `Listing`, `SyncLog`)
- **API Integration**: Shopify Storefront GraphQL API & Admin REST/GraphQL APIs
- **Development Fallback**: Built-in mock dataset loader (`data/mock-slots.ts`) for offline testing

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

Create a `.env.local` file in the project root (see [`.env.example`](./.env.example) for template):

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

## 🗄️ Database Schema Summary

- `Merchant`: Stores connected Shopify domain, OAuth access token, logo, and status (`ACTIVE`, `PENDING`).
- `Listing` (Slots): Stores slot number (`SLOT #001`), title, price, compare-at price, inventory quantity, status (`AVAILABLE`, `RESERVED`, `SOLD`), tags, images, variants, and Shopify GIDs.
- `SyncLog`: Stores audit logs for `products/create`, `products/update`, `products/delete`, and `inventory_levels/update` webhook events.

---

## 📡 API Endpoint Index

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shopify/auth` | Initiate Shopify OAuth 2.0 authorization |
| `GET` | `/api/shopify/callback` | Handle OAuth callback, exchange token & register webhooks |
| `POST` | `/api/shopify/sync` | Re-sync merchant product catalog |
| `POST` | `/api/webhooks/shopify` | Ingest HMAC-verified Shopify webhooks |

---

## 📚 Complete Technical Documentation (`docs/`)

Explore the dedicated documentation guides inside the [`docs/`](./docs) folder:

1. 🚀 [**Getting Started Guide**](./docs/GETTING_STARTED.md)
2. 🏛️ [**System Architecture & Technical Specifications**](./docs/ARCHITECTURE.md)
3. 🔑 [**Shopify API & Webhook Integration Deep-Dive**](./docs/SHOPIFY_INTEGRATION.md)
4. 📡 [**API Endpoint Reference Manual**](./docs/API_REFERENCE.md)
5. 🎨 [**Design System Specification**](./docs/DESIGN_SYSTEM.md)

---

## 🧪 Verification & Build

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Production build
npm run build
```

---

## 📄 License

MIT © 2026 DeLorean Marketplace x Masters' Union Engine
