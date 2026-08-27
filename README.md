# Masters' Union Shopify Multi-Vendor Dropshipping Marketplace
### Full-Stack Engineering & AI Product Management Master Platform

> High-performance, gallery-grade B2B Multi-Vendor Dropshipping Marketplace built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM 7**, and **PostgreSQL / Supabase**. Designed for the Generative AI era with a **Dual Developer & AI Product Manager Architecture**, featuring contained hero video presentation, sticky left sidebar filtering, high-contrast `#FFE082` product grid backdrops, solid obsidian listing cards, animated Masters Union popup drawer branding, and automated Shopify catalog scraping.

![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss)
![Prisma](https://img.shields.io/badge/ORM-Prisma%207-2D3748?style=flat-square&logo=prisma)
![Supabase](https://img.shields.io/badge/Backend-Supabase%20(Postgres%20|%20Auth%20|%20Storage)-3ECF8E?style=flat-square&logo=supabase)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker)
![Shopify](https://img.shields.io/badge/Integration-Shopify%20GraphQL-96BF48?style=flat-square&logo=shopify)

---

## 📌 Dual Developer & AI Product Manager Perspective

This repository is engineered to serve a dual purpose: a production-ready codebase for **Full-Stack Developers** and an architectural reference guide for **AI Product Managers / Technical PMs**.

### 📊 PM Core Metrics & Product SLAs
- **Time-to-Onboard (TTO)**: Ingests 50+ Shopify product variants from custom store domains in `< 1.0s`.
- **Platform Trust & Anti-Spam**: Mandatory `PENDING` state with Human-in-the-Loop (HitL) Admin OTP approval guaranteeing **0 unauthorized listings** on the public catalog.
- **Zero-Downtime Deployment SLA**: Sequential CI/CD pipeline (`prisma migrate deploy && seed-prod`) delivering **100% build deployment reliability**.
- **Multi-Tenant Data Privacy**: Store-isolated passcodes (`authorizedStoreId`) ensuring **zero cross-vendor data leaks**.
- **Hardware-Agnostic Usability**: `#FFE082` yellow container backdrop framing solid obsidian dark cards (`bg-zinc-950/95`) guaranteeing high visual contrast across OLED, IPS, and mobile displays.

---

## ⚡ Key Features & System Capabilities

- 🎥 **Hero Section Contained Ambient Background Video Card**:
  - Video background contained inside a rounded hero container card (`relative w-full h-full rounded-3xl overflow-hidden`) to eliminate page-wide visual noise.
  - Floating ambient video controls (ON/OFF toggle, play/pause) positioned in the bottom-right corner.
  - Lightened dark gradient overlay tints (`from-black/60 via-transparent to-black/20`) for clear animation display.
- 🔀 **Sticky Left Sidebar Filter Pane (`VendorFilterBar.tsx`)**:
  - Re-architected top horizontal filter bar into a sticky vertical left sidebar (`w-full lg:w-72`).
  - Search box, category filter converted into a native `<select>` dropdown menu matching vendor store and sort selectors.
  - Matching item count badge and 1-click filter reset button.
- 🎨 **High-Contrast `#FFE082` Product Grid & Obsidian Cards**:
  - Main marketplace grid wrapped in a custom background container (`bg-[#FFE082] rounded-3xl p-6 sm:p-8 border border-[#FFE082]/50 shadow-2xl`).
  - Product listing cards (`ListingCard.tsx`) styled with solid obsidian dark surfaces (`bg-zinc-950/95`), crisp borders (`border-zinc-800`), comparison price tags, and vendor domain pills for high legibility.
- 🖼️ **Product Inspection Popup Drawer Branding (`ListingDrawer.tsx`)**:
  - Fixed drawer header features the animated Masters Union logo (`/assets/logoanimationblack.gif`) alongside product status badges (`AVAILABLE`, `RESERVED`, `SOLD OUT`).
  - Slide-over product details with variant selectors, wholesale pricing callouts, and 1-click WhatsApp B2B inquiry CTA.
- 🔐 **Dual-Factor Admin Auth & Transactional Email Dispatch**:
  - Protected Admin desk (`/admin`) with email OTP verification dispatched via Nodemailer / SMTP.
  - Offline local development email testing using local Supabase Inbucket mailbox container (`http://127.0.0.1:54324`).
  - Cryptographically secure 6-digit numeric tokens with 10-minute expiry and single-use database invalidation (`admin_otps` model).
- 💼 **Store-Isolated Vendor Portals**:
  - Vendor portal (`/vendor`) with store-isolated authentication (`vendorPasscode`) preventing cross-store data tampering.
- 🔄 **Real-Time Shopify Storefront Scraping & Webhook Integration**:
  - Public catalog scraper supporting custom domains (`cleanStoreDomain` and candidate URL discovery).
  - Stream-level HMAC-SHA256 signature verification (`req.text()`) on incoming Shopify webhooks.
  - Non-blocking custom DOM event propagation (`store-state-changed`) for cross-tab reactivity without network polling.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Components, Server Actions)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + Framer Motion + Lucide Icons
- **Database & ORM**: PostgreSQL managed via Prisma ORM 7 (`prisma.config.ts`, `schema.prisma`) with `@prisma/adapter-pg`
- **Email Dispatch**: Transactional SMTP Email (Nodemailer) + Inbucket Local Mailbox Testing (`:54324`)
- **Backend-as-a-Service**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`, Supabase Storage)
- **API Integrations**: Shopify Storefront GraphQL & REST APIs + Webhook Stream Ingestion
- **Testing**: Vitest automated unit testing suite

---

## 📂 Project Documentation

Detailed technical architecture and PM specifications are available in `docs/`:

| Document | Purpose & Target Audience |
| :--- | :--- |
| 📘 [`docs/FINDINGS_AND_LEARNINGS.md`](docs/FINDINGS_AND_LEARNINGS.md) | **Full-Stack Engineering & AI Product Management Master Playbook** (18 sections: 10 Golden Laws, Pre-Flight Checklist, PM Translation Dictionary, Gotchas, and 6 Architectural Case Studies). |
| 📗 [`docs/PROJECT_FEATURES.md`](docs/PROJECT_FEATURES.md) | Comprehensive feature specifications, user stories, business logic, and API endpoints. |
| 📙 [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Design tokens, `#FFE082` contrast physics, obsidian card specs, and Tailwind component interfaces. |
| 📕 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, component tree breakdown, serverless database pooler strategy, and streaming boundaries. |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your database and authentication credentials:
```bash
cp .env.example .env
```

### 3. Run Database Migrations & Local Seeder
```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Unit Tests
```bash
npm run test
```

---

## 🛠️ Build & CI/CD Deployment Pipeline

To deploy to Vercel or Supabase Cloud, execute the sequential build command:
```bash
npm run build
```
*(Executes `prisma generate && prisma migrate deploy && tsx prisma/seed-prod.ts && next build`)*
