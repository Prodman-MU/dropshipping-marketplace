# Masters' Union Shopify Multi-Vendor Dropshipping Marketplace

> Gallery-grade, modern B2B Multi-Vendor Dropshipping Marketplace platform built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma 7**, and **PostgreSQL / Supabase**. Inspired strictly by the design systems of **Apple Store**, **MR PORTER**, and **Grailed**, featuring zero-border product grids, studio neutral photography frames, high-contrast editorial typography, dynamic discount calculations, and real-time Shopify synchronization.

![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748?style=flat-square&logo=prisma)
![Supabase](https://img.shields.io/badge/Backend-Supabase%20(Postgres%20|%20Auth%20|%20Storage)-3ECF8E?style=flat-square&logo=supabase)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker)
![Shopify](https://img.shields.io/badge/Integration-Shopify%20GraphQL-96BF48?style=flat-square&logo=shopify)

---

## ⚡ Key Features & Capabilities

- 🏛️ **Apple Store × MR PORTER × Grailed Design System**:
  - **Pure White Canvas (`#FFFFFF`)**: Zero-border product cards with generous whitespace, removing all brutalist block outlines and harsh offset shadows.
  - **Studio Neutral Image Backdrops (`#F5F5F7`)**: Clean photography containers with subtle hover zoom and secondary image preview.
  - **Editorial Typography Hierarchy**: High-contrast `Playfair Display` serif headlines, `Inter` UI sans, and `JetBrains Mono` 11px uppercase micro-data badges.
  - **Frosted Glass Sticky Header**: Translucent backdrop blur (`glass-header`) with blackbox animated GIF logo lockup.
- 🏷️ **Dynamic Discount % Calculation**:
  - Automatic discount percentage calculation (`compareAtPrice` vs `price`).
  - Corner discount pill badge (e.g. `-35%`) on product cards.
  - Inline price tag with slashed comparison amount and `{discount}% OFF` label in emerald green.
- 🌀 **Animated SVG Squiggle Hero Carousel & Co-Marketing**:
  - Continuous multi-color gradient SVG stroke draw-and-erase animation (Masters' Union baseline).
  - Auto-rotating slides with hairline progress bar, dot navigation, and next/prev controls.
  - Live slide sequence reordering and deletion in Admin portal.
- 📣 **Hero Banner & Vendor Co-Marketing Ad Spotlight**:
  - **Vendor Submission Desk**: Vendors submit campaign ads in 3 formats: **Image Ad**, **Video Ad**, and **Editorial Showcase**.
  - **Dual Media Ingestion**: Direct file upload to Supabase Storage bucket (`marketplace-assets`) with fallback, or external CDN URL.
  - **Live Mockup Simulator**: Interactive real-time hero slide preview before submission.
  - **Admin Approval Queue**: 1-click **"Approve & Add to Hero"** (updates PostgreSQL and live homepage carousel rotation) or **"Reject"** with custom feedback.
  - **Admin System Banners**: Curated library of brand assets (featuring Masters' Union animated SVG squiggle) with 1-click toggle switches.
- 🔀 **Control Bar & Slide-Over Filter Drawer**:
  - 1-tap horizontal category pill rail with active pill indicator.
  - Slide-over filter drawer with store selector, category checklist, and sorting controls.
- 🛍️ **Apple Store Quick-View Modal & Dedicated PDP (`/product/[id]`)**:
  - 2-column asymmetric layout with studio vertical photo gallery and sticky purchase column.
  - Variant selector pills, wholesale rate callouts, 1-click WhatsApp B2B inquiry CTA, and direct Shopify checkout.
- 🛡️ **Minimalist Admin Moderation Desk (`/admin`)**:
  - Protected passcode access gate (`admin123`) with email OTP reset flow.
  - Store moderation tabs (`Pending`, `Active`, `Rejected`), granular per-store refresh, bulk sync triggers, dedicated **Hero Banners & Ads** desk, and consolidated Website Settings.
- 💼 **Vendor Analytics Desk (`/vendor`)**:
  - Dual-pane access gate (`Vendor Login` | `Connect Store`).
  - Sub-navigation tabs: **Inventory Management** and **Hero Ad Spotlight**.
  - KPI metric cards, store catalog live sync, passcode self-service update modal, and inventory inspection table.
- 🔄 **Real-Time Shopify Storefront & Webhook Synchronization**:
  - Connect stores via myshopify domain with automated product, variant, image, and inventory ingestion.
  - Dual sync pipelines: granular single-store sync (`/api/shopify/sync`) and scheduled bulk sync (`/api/cron/sync`).
  - Non-blocking error alerts and cross-tab reactivity via `"store-state-changed"` event broadcasting.
- 🧪 **Comprehensive Automated Unit Testing Suite**:
  - 8 test suites with 67 tests passing (100% pass rate) using Vitest covering API endpoints, settings manager, store manager, Shopify utilities, passcode security, and UI components.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Components, Server Actions)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Framer Motion + Lucide Icons
- **Database & ORM**: PostgreSQL managed via Prisma ORM 7 (`prisma.config.ts`, `schema.prisma`)
- **Backend-as-a-Service**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`, Supabase Storage)
- **API Integrations**: Shopify Storefront GraphQL API & Admin REST/GraphQL APIs
- **Typography**: Inter (Sans), Playfair Display (Serif), JetBrains Mono (Micro-data)

---

## 📂 Project Documentation

Detailed architecture and design specifications are available in the `docs/` directory:

| Document | Description |
|---|---|
| [`docs/SITE_DESIGN_THEME.md`](docs/SITE_DESIGN_THEME.md) | **Complete Site Design Theme Specification (Apple × MR PORTER × Grailed)** |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | CSS Tokens, typography hierarchy, and component interfaces |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Full system architecture, data flow, and PostgreSQL/Prisma schema |
| [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) | REST API endpoints for merchants, listings, and Shopify synchronization |
| [`docs/SHOPIFY_INTEGRATION.md`](docs/SHOPIFY_INTEGRATION.md) | Shopify Storefront GraphQL & Admin webhook setup guide |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npx next build
```

### 4. Run Automated Test Suite
```bash
npm test
```
Executes 8 Vitest test suites (67 tests) verifying REST API endpoints, Shopify parsers, store management, and UI components.

---

## 🔑 Default Access Passcodes (Demo & Development)

- **Admin Portal Desk (`/admin`)**: `admin123`
- **Vendor Portal Master Key (`/vendor`)**: `vendor123`
- **Vendor Store Passcodes**: `<storedomain>123` (e.g. `test123`, `apex123`)
