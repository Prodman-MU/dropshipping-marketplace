# Exhaustive Platform Feature Specification

Welcome to the comprehensive feature catalog for the **Masters' Union Shopify Multi-Vendor Marketplace Platform**.

---

## 🎨 1. Aesthetics & User Interface Features

- **Pure Black & Cyber Gold Theme**:
  - High-contrast pure black `#000000` background with elevated glassmorphic card containers (`#121216`).
  - Radiant Cyber Gold & Amber Yellow accent tokens (`#f59e0b` / `#fbbf24`) for buttons, active state badges, glowing borders, and monospace text highlights.
  - Vibrant `#FFE082` backdrop styling for the main product grid container with high-contrast obsidian cards (`bg-zinc-950/95`).
- **Contained Hero Background Video Canvas**:
  - Hero container card video (`Hero.tsx` & `BackgroundVideo.tsx`) rendering clean ambient video (`public/assets/masters_union_dropshipping_v1.mp4`).
  - Floating bottom-right toggle control bar inside hero card for turning ambient video **ON/OFF** and pausing/playing the video loop.
- **Animated GIF Logo**:
  - Header animated logo (`public/assets/logoanimationblack.gif`) wrapped in a Next.js `Link` for 1-click homepage navigation.
  - Top-left animated logo in product inspection drawer header for consistent brand identity.

---

## 📦 2. Product Catalog & Marketplace Grid

- **"Dropshipped Products" Section Header**:
  - Dedicated section text block introducing live marketplace catalog items synchronized from active Shopify storefronts.
- **Product-Centric Listing Cards**:
  - Clean card design featuring high-resolution product preview images with smooth hover scale transitions (`group-hover:scale-105`), vendor badges, and price tags.
  - Bold product titles and direct product inspection trigger buttons (`INSPECT DETAILS →`).
- **Yellow `#FFE082` Grid Canvas**:
  - Product cards rest on a vibrant `#FFE082` rounded backdrop container (`bg-[#FFE082] rounded-3xl p-6 sm:p-8 border border-[#FFE082]/50 shadow-2xl`).

---

## 🔍 3. Left Filter Sidebar & Search System

- **Left Sidebar Filter Pane (`VendorFilterBar.tsx`)**:
  - Sticky vertical left-hand sidebar pane (`w-full lg:w-72`) hosting catalog search, category dropdown, vendor store dropdown, and sort selectors.
- **Category Dropdown Filter**:
  - Category selector styled as a clean `<select>` dropdown menu listing all unique product categories.
- **Multi-Vendor Storefront Selector**:
  - Dropdown filter to isolate products by specific connected Shopify store domains (`apex-gear.myshopify.com`, `nordic-tech.myshopify.com`, `chrono-craft.myshopify.com`).
- **Catalog Search & Sorting Engine**:
  - Real-time search across titles, SKUs, and vendor domains; sort by Default Order, Price (Low to High), Price (High to Low), and Inventory Stock Levels.

---

## 📱 4. Product Inspection Drawer & Backdrop Popout

- **Masters Union Logo Header**:
  - Animated Masters Union logo displayed at top left of product details drawer header alongside availability status pill.
- **Connected Shopify Store Popout Backdrop**:
  - When inspecting a product, the left dark blurred backdrop container displays the **connected Shopify merchant store logo**, store name, domain, and `VERIFIED SHOPIFY VENDOR` badge.
  - **Interactive Popout**: Clicking the merchant logo card opens the vendor's live Shopify storefront domain (`https://${merchant.myshopifyDomain}`) in a new tab (`target="_blank"`).
- **3-Tab Detail Panel (Framer Motion Slide-Out)**:
  1. **Product Specs**: High-res image gallery, variant selection buttons, detailed overview description, and category/tag pills.
  2. **Shopify & Inventory**: Live Shopify Storefront Product GIDs, Variant GIDs, SKUs, stock quantities, and variant inventory matrix tables.
  3. **Webhook Sync Logs**: Audit trail of real-time `products/create`, `products/update`, and `inventory_levels/update` webhook events.
- **Direct Buyer Checkout**:
  - Sticky bottom action footer with a `Buy on Shopify Storefront ↗` checkout button.

---

## 🔐 5. Shopify Admin OAuth 2.0 & Webhook Integration

- **Shopify Merchant Store Connection Modal**:
  - Modal form for connecting new Shopify storefronts dynamically (`/api/shopify/auth`).
- **OAuth 2.0 Access Token Exchange**:
  - Handles Shopify authorization callbacks (`/api/shopify/callback`), Exchanges code for access tokens, and securely registers mandatory webhooks.
- **HMAC SHA256 Webhook Pipeline**:
  - Public route (`/api/webhooks/shopify`) that verifies incoming webhook signatures against `SHOPIFY_WEBHOOK_SECRET` before updating PostgreSQL database listings.
- **Catalog Re-Sync API**:
  - On-demand endpoint (`/api/shopify/sync`) to pull updated products, variants, and stock counts.
- **Built-In Mock Offline Fallback**:
  - Seamless fallback to `data/mock-slots.ts` when offline or testing without live Shopify Partner credentials.

---

## 📚 Document Index Summary

| Document | Description |
|---|---|
| 📄 [`README.md`](file:///d:/lab/projects/dropshipping-marketplace/README.md) | High-level summary, tech stack, custom asset placement guide, and quick start instructions |
| 🚀 [`docs/GETTING_STARTED.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/GETTING_STARTED.md) | Local environment setup, environment variables (`.env.local`), database push, and ngrok webhook testing |
| 🏛️ [`docs/ARCHITECTURE.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/ARCHITECTURE.md) | Event-driven Next.js architecture, sequence diagrams, Prisma PostgreSQL schema, and component directory tree |
| 🔑 [`docs/SHOPIFY_INTEGRATION.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/SHOPIFY_INTEGRATION.md) | Shopify Storefront GraphQL queries, OAuth 2.0 protocol, webhook pipeline, HMAC verification, and rate limiting |
| 📡 [`docs/API_REFERENCE.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/API_REFERENCE.md) | HTTP endpoint specifications, request parameters, response headers, and sample JSON payloads |
| 🎨 [`docs/DESIGN_SYSTEM.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/DESIGN_SYSTEM.md) | Cyber Gold & Pure Black design system tokens, CSS glassmorphic utilities, monospace rules, and video transforms |
| ✨ [`docs/PROJECT_FEATURES.md`](file:///d:/lab/projects/dropshipping-marketplace/docs/PROJECT_FEATURES.md) | **(This Document)** Exhaustive feature catalog and functional specification guide |
