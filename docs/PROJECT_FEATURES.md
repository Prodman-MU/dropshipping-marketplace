# Exhaustive Platform Feature Specification

Welcome to the comprehensive feature catalog for the **Masters' Union Shopify Multi-Vendor Marketplace Platform**.

---

## 🎨 1. Aesthetics & User Interface Features

- **Pure Black & Cyber Gold Theme**:
  - High-contrast pure black `#000000` background with elevated glassmorphic card containers (`#121216`).
  - Radiant Cyber Gold & Amber Yellow accent tokens (`#f59e0b` / `#fbbf24`) for buttons, active state badges, glowing borders, and monospace text highlights.
- **Scrollable Ambient Background Video Canvas**:
  - Scroll-reactive video background (`public/assets/masters_union_dropshipping_v1.mp4`) with 100% true brightness and scroll opacity transforms (`useTransform`).
  - Floating bottom-right toggle control bar for turning ambient video **ON/OFF** and pausing/playing the video loop.
- **Clickable Header Animated GIF Logo**:
  - Top-left animated logo (`public/assets/logoanimationblack.gif`) wrapped in a Next.js `Link` for 1-click navigation back to the homepage from any view.

---

## 📦 2. Product Catalog & Marketplace Grid

- **Product-Centric Listing Cards**:
  - Clean card design featuring high-resolution product preview images with smooth hover scale transitions (`group-hover:scale-105`).
  - Bold product titles and direct product inspection trigger buttons (`INSPECT PRODUCT DETAILS →`).
  - Completely removed legacy slot numbering and slot count clutter for a pure product discovery experience.
- **Dynamic Category Pills & Live Product Counter**:
  - Automatically extracts unique product categories from connected Shopify merchant catalogs.
  - Live product counter badge displaying matching search results (`9 Products`).

---

## 🔍 3. Search & Filtering System

- **Primary Header Search Bar**:
  - Sticky navbar search input for real-time querying across product titles, SKUs, and merchant domains.
- **Expandable Compact Filter Search Button**:
  - Secondary search trigger button inside the filter section (`[ 🔍 Search Catalog... ]`).
  - Expands smoothly on click or focus into an active input field with an `X` collapse button, eliminating visual clutter.
- **Multi-Vendor Storefront Selector**:
  - Dropdown filter to isolate products by specific connected Shopify store domains (`apex-gear.myshopify.com`, `nordic-tech.myshopify.com`, `chrono-craft.myshopify.com`).
- **Sorting Engine**:
  - Sort products by Default Order, Price (Low to High), Price (High to Low), and Inventory Stock Levels.

---

## 📱 4. Product Inspection Drawer & Backdrop Popout

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
