# Exhaustive Platform Feature Specification

Welcome to the comprehensive feature catalog for the **Masters' Union Shopify Multi-Vendor Dropshipping Marketplace Platform**.

---

## 🎨 1. Aesthetics & Bauhaus UI System

- **Bauhaus Design Aesthetics**:
  - Light-mode `#F4F4F0` canvas paired with `#111111` solid borders (2px/3px/4px) and hard offset block shadows (`shadow-[4px_4px_0px_#111111]`).
  - Signature `#FFB703` Cyber Gold accents, `#005F73` Deep Teal contrast badges, and `#D62828` Crimson action highlights.
- **Hero Video Section**:
  - Contained ambient video hero card (`Hero.tsx` & `BackgroundVideo.tsx`) showcasing clean background video (`/assets/masters_union_dropshipping_v1.mp4`) with floating ON/OFF toggle and play/pause controls.
- **Header Navigation & Brand Identity**:
  - Sticky header with icon-only `<ArrowLeft />` back button when inspecting product detail pages.
  - Header animated logo (`/assets/logoanimationblack.gif`) displaying `/ DROPSHIPPING 2026` text badge (always visible on mobile and desktop).
  - Ticker pill displaying live approved store counts and live synced product counts.

---

## 🛍️ 2. Dedicated Product Pages (`/product/[id]`)

- **Full-Page Detail Route**:
  - Replaced popup modals with a dedicated product page route (`/product/[id]`).
- **Interactive Multi-Image Gallery**:
  - Main image viewport with smooth zoom hover transitions and thumb selection bar.
- **Ordered Product Hierarchy**:
  - Ordered as Category Tag → Product Title → Full Description Box → Price & MSRP Discount Box → Variant Option Selector → Action CTAs → Fulfilling Merchant Vendor Card.
- **WhatsApp B2B Inquiry CTA (1st Action)**:
  - High-impact WhatsApp green (`#25D366`) button with official SVG logo icon.
  - Generates pre-filled click-to-chat inquiry messages containing store name, product title, SKU, price, and B2B vendor terms request.
- **Direct Shopify Checkout CTA (2nd Action Box)**:
  - Direct checkout link opening the product on the merchant's live Shopify storefront.
- **Copy Specifications Tool**:
  - 1-click clipboard copy utility for product specs (title, price, category, SKU, store domain, and checkout URL).
- **Related Products Carousel**:
  - 4-card related products carousel at the bottom of the detail page.

---

## 📱 3. Mobile Optimization & Sticky Filter Bar

- **2-Column Mobile Product Grid**:
  - Responsive `grid-cols-2` product grid on mobile screens.
  - Fixed-height title containers (`h-8 sm:h-12`) ensuring store names align on the exact same horizontal baseline across grid rows.
- **Sticky Bottom Filter Bar (`VendorFilterBar.tsx`)**:
  - Fixed bottom bar (`sticky bottom-0 z-40`) on mobile screens.
  - Top row: 1-tap horizontal scrollable category pills (`All Products`, `Tactical Tech & EDC`, etc.).
  - Bottom row: Fast search input + "Filter Options" button triggering a slide-up sheet drawer for vendor isolation, sort order (`In-Stock First`), and reset actions.

---

## 🏷️ 4. Clean Inventory Status Logic

- **Hidden Numerical Inventory Counts**:
  - Numerical unit counts (e.g. `18 UNITS IN STOCK`, `18 LEFT`) and `"INVENTORY UNKNOWN"` badges are hidden across all cards and pages.
- **Conditional Out-of-Stock Badges**:
  - Items in stock display clean pricing without inventory numbers.
  - Items out of stock display a prominent, high-contrast **`OUT OF STOCK`** tag right next to the price.

---

## ⚙️ 5. Admin Portal & Website Settings

- **Store Moderation Suite (`/admin`)**:
  - Tabbed admin portal for approving, rejecting, or disconnecting candidate Shopify storefronts.
- **Dynamic Site Settings (`settings-manager.ts`)**:
  - Form to customize global parameters: Dropshipping Year (e.g. `2026`, `2027`), Site Title, Announcement Text, and Catalog Badge Text.
  - Real-time UI mockup preview and site-wide DOM event synchronization (`"site-settings-changed"`).
- **Master Vendor Key**:
  - Super-passcode allowing marketplace admins to inspect any store workspace in `/vendor`.

---

## 🗄️ 6. Cloud Database & Prisma 7 Architecture

- **Decoupled Prisma 7 Schema (`schema.prisma`)**:
  - Separate `Listing` (Catalog) and `Inventory` models linked by 1-to-1 relationships.
  - `SiteSetting` model for global website configuration.
- **Docker Compose Setup**:
  - `docker-compose.yml` orchestrating PostgreSQL 16 container and Next.js development server with Turbopack HMR.
- **Supabase Cloud Deployment Setup**:
  - `DATABASE_URL` (Port 6543 transaction pooler for serverless App Router API routes).
  - `DIRECT_URL` (Port 5432 session pooler for Prisma CLI migrations).
  - Automated `prisma generate && next build` pipeline for zero-downtime Vercel deployments.

---

## 📚 Document Index Summary

| Document | Description |
|---|---|
| 📄 [`README.md`](file:///d:/lab/projects/dropshipping-marketplace/README.md) | High-level summary, tech stack, asset placement guide, and quick start instructions |
| 🚀 [`docs/GETTING_STARTED.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/GETTING_STARTED.md) | Local environment setup, Docker Compose commands, environment variables, and ngrok webhook testing |
| 🏛️ [`docs/ARCHITECTURE.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/ARCHITECTURE.md) | Event-driven Next.js architecture, sequence diagrams, Prisma 7 schema, and component tree |
| 🔑 [`docs/SHOPIFY_INTEGRATION.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/SHOPIFY_INTEGRATION.md) | Shopify Storefront GraphQL queries, OAuth 2.0 protocol, webhook pipeline, and domain parsing (`getDomainCandidates`) |
| 📡 [`docs/API_REFERENCE.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/API_REFERENCE.md) | HTTP endpoint specifications, request parameters, response headers, and sample JSON payloads |
| 🎨 [`docs/DESIGN_SYSTEM.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/DESIGN_SYSTEM.md) | Bauhaus visual design tokens, border weights, offset block shadow utilities, and color palettes |
| ✨ [`docs/PROJECT_FEATURES.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/PROJECT_FEATURES.md) | **(This Document)** Exhaustive feature catalog and functional specification guide |
