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

## 🔀 2. Dual Catalog View Modes (Grid vs. Grouped by Vendor)

- **View Switcher Toolbar**:
  - Tactile neo-brutalist toggle buttons (`[Grid View | By Vendor]`) on the catalog toolbar.
  - Switches between standard global product pagination and structured store-by-store grouping without reloading.
- **Grouped by Vendor Layout (`VendorGroupedSection.tsx`)**:
  - **Streamlined Store Banner**: Left-aligned store logo + store name/domain; right-aligned direct external link (`Visit Store` ↗) and `Filter Store` shortcut action.
  - **1-Row Responsive Subgrid**:
    - Displays exactly **1 row per store** by default (**3 products on Desktop/LG**, **2 products on Mobile**).
  - **Expand / Collapse Toggle**: If a vendor has more than 1 row of products, a "Show All [N] Products" / "Show 1 Row Only" button allows smooth catalog inspection without cluttering the page.
- **Smart Filtering & Sorting**:
  - Vendors with 0 matching items under active category or search filters are automatically hidden.
  - Vendors are ranked by most matching products first, and products within each vendor section are sorted according to active sort order (Price, Stock, Slot).
  - Clicking "Filter Store" isolates the vendor in the catalog and smooth-scrolls up.
- **State Persistence & URL Sync**:
  - Persists selected view mode in `localStorage` (`catalog_view_mode`).
  - Supports `?view=vendor` and `?view=grid` URL query parameters for direct sharing.

---

## 🛍️ 3. Dedicated Product Pages (`/product/[id]`)

- **Full-Page Detail Route**:
  - Dedicated product page route (`/product/[id]`) replacing intrusive modal popups.
- **Interactive Multi-Image Gallery**:
  - Main image viewport with smooth zoom hover transitions and thumbnail selection bar.
- **Ordered Product Hierarchy**:
  - Category Tag → Product Title → Full Description Box → Price & MSRP Discount Box → Variant Option Selector → Action CTAs → Fulfilling Merchant Vendor Card.
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

## 📱 4. Mobile Optimization & Sticky Filter Bar

- **2-Column Mobile Product Grid**:
  - Responsive `grid-cols-2` product grid on mobile screens.
  - Fixed-height title containers (`h-8 sm:h-12`) ensuring store names align on the exact same horizontal baseline across grid rows.
- **Sticky Bottom Filter Bar (`VendorFilterBar.tsx`)**:
  - Fixed bottom bar (`sticky bottom-0 z-40`) on mobile screens.
  - Top row: 1-tap horizontal scrollable category pills (`All Products`, `Tactical Tech & EDC`, etc.).
  - Bottom row: Fast search input + "Filter Options" button triggering a slide-up sheet drawer for vendor isolation, sort order (`In-Stock First`), and reset actions.

---

## 🏷️ 5. Clean Inventory Status Logic

- **Hidden Numerical Inventory Counts**:
  - Numerical unit counts (e.g. `18 UNITS IN STOCK`, `18 LEFT`) and `"INVENTORY UNKNOWN"` badges are hidden across all cards and pages.
- **Conditional Out-of-Stock Badges**:
  - Items in stock display clean pricing without inventory numbers.
  - Items out of stock display a prominent, high-contrast **`OUT OF STOCK`** tag right next to the price.

---

## 🔒 6. Supabase Auth & Route Security

- **Server-Side Cookie Authentication (`@supabase/ssr`)**:
  - Session tokens stored in encrypted, HttpOnly, SameSite cookies.
- **Automatic Token Refreshing**:
  - Next.js root `middleware.ts` automatically intercepts incoming requests and refreshes expiring JWT access tokens in the background.
- **Multi-Tier Role Management**:
  - Admins authenticate via secure passcodes or admin roles.
  - Merchants link their Supabase Auth `user.id` to their `Merchant` database record (`supabaseUserId`).

---

## 📦 7. Supabase Storage Integration

- **Public Assets Bucket (`marketplace-assets`)**:
  - Storage bucket for merchant store logos and custom promotional banners.
- **Optimized CDN Routing**:
  - Merchant logos uploaded to Supabase Storage are served via Supabase's global CDN.
  - High-volume Shopify product images are loaded directly from Shopify's Edge CDN.

---

## ⚙️ 8. Admin Portal & Website Settings

- **Store Moderation Suite (`/admin`)**:
  - Tabbed admin portal for approving, rejecting, or disconnecting candidate Shopify storefronts.
- **Dynamic Site Settings (`settings-manager.ts`)**:
  - Form to customize global parameters: Dropshipping Year (e.g. `2026`, `2027`), Site Title, Announcement Text, and Catalog Badge Text.
  - Real-time UI mockup preview and site-wide DOM event synchronization (`"site-settings-changed"`).
- **Master Vendor Key**:
  - Super-passcode allowing marketplace admins to inspect any store workspace in `/vendor`.

---

## 🗄️ 9. Cloud Database & Prisma 7 Architecture

- **Decoupled Prisma 7 Schema (`schema.prisma`)**:
  - Separate `Listing` (Catalog) and `Inventory` models linked by 1-to-1 relationships.
  - `SiteSetting` model for global website configuration.
- **Local Development via Supabase CLI**:
  - `supabase/config.toml` configuring local Docker stack with PostgreSQL (`:54322`), Studio Dashboard (`:54323`), and Inbucket (`:54324`).
- **Supabase Cloud Deployment Setup**:
  - `DATABASE_URL` (Port 6543 transaction pooler for serverless App Router API routes).
  - `DIRECT_URL` (Port 5432 session pooler for Prisma CLI migrations).
  - Automated `prisma generate && next build` pipeline for zero-downtime Vercel deployments.

---

## 📚 Document Index Summary

| Document | Description |
|---|---|
| 📄 [`README.md`](file:///d:/lab/projects/dropshipping-marketplace/README.md) | High-level summary, tech stack, asset placement guide, and quick start instructions |
| 📖 [`docs/DATABASE_AND_AUTH_DEEP_DIVE.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/DATABASE_AND_AUTH_DEEP_DIVE.md) | Foundational guide on Supabase, Prisma, connection pooling, and cookie auth |
| 🚀 [`docs/GETTING_STARTED.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/GETTING_STARTED.md) | Local environment setup, Docker & Supabase CLI commands, and environment variables |
| 🏛️ [`docs/ARCHITECTURE.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/ARCHITECTURE.md) | Event-driven Next.js architecture, sequence diagrams, Prisma 7 schema, and component tree |
| 🔑 [`docs/SHOPIFY_INTEGRATION.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/SHOPIFY_INTEGRATION.md) | Shopify Storefront GraphQL queries, OAuth 2.0 protocol, webhook pipeline, and domain parsing |
| 📡 [`docs/API_REFERENCE.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/API_REFERENCE.md) | HTTP endpoint specifications, request parameters, response headers, and sample JSON payloads |
| 🎨 [`docs/DESIGN_SYSTEM.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/DESIGN_SYSTEM.md) | Bauhaus visual design tokens, border weights, offset block shadow utilities, and color palettes |
| ✨ [`docs/PROJECT_FEATURES.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/PROJECT_FEATURES.md) | **(This Document)** Exhaustive feature catalog and functional specification guide |
