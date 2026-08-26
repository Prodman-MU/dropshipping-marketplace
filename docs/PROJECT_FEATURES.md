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
  - Granular single-store refresh (`handleSyncStore`) and bulk synchronizer (`handleSyncAllStores`) with non-blocking error toast feedback.
- **Dedicated Hero Banners & Ads Desk**:
  - Centralized moderation control for vendor ad campaign submissions, admin brand asset toggles, and live slide sequence reordering.
- **Dynamic Site Settings (`settings-manager.ts`)**:
  - Consolidated settings form: Dropshipping Year (e.g. `2026`, `2027`), Marketplace Organization Title, and Admin Passcode Security.
  - Real-time UI mockup preview and site-wide DOM event synchronization (`"site-settings-changed"`).
  - Quick-action cross-link card into the dedicated Hero Desk.
- **Master Vendor Key**:
  - Super-passcode allowing marketplace admins to inspect any store workspace in `/vendor`.

---

## 📣 10. Hero Banner & Vendor Co-Marketing Ad Spotlight

- **Vendor Ad Submission Portal (`/vendor`)**:
  - Sub-navigation tab: `"HERO_ADS"` alongside `"INVENTORY"`.
  - **3 Distinct Ad Formats**:
    1. **Image Ad (`IMAGE_AD`)**: Studio product photography campaign slide.
    2. **Video Ad (`VIDEO_AD`)**: Autoplaying background video slide.
    3. **Editorial Showcase (`SHOWCASE`)**: Curated editorial drop with headline and description copy.
  - **Dual Media Ingestion**: Direct file upload to Supabase Storage bucket (`marketplace-assets`) or external CDN image/video URL input.
  - **Live Mockup Simulator**: Interactive real-time preview reflecting the exact proportions, badge typography, and CTA button layout of the live homepage Hero.
  - **My Requests Queue**: Live status tracker (`PENDING REVIEW`, `LIVE ON HERO`, `REJECTED`) displaying admin feedback on rejected submissions.
- **Admin Moderation & Carousel Management (`/admin`)**:
  - **Vendor Ad Requests Desk**: Card grid with format pills, creative previews, vendor domain, and 1-click **"Approve & Add to Hero"** (updates DB via `PATCH /api/ads` + adds slide to carousel in one click) or **"Reject"** with custom feedback modal.
  - **Official Admin System Banners**: Curated library of brand templates headed by the **Masters' Union Animated SVG Squiggle** banner, featuring 1-click toggle switches to activate or deactivate each banner from the live homepage carousel.
  - **Active Hero Carousel Sequence Manager**: Visual sequence inspector with Move Up / Move Down reordering controls and delete actions.

---

## 🧪 11. Automated Testing & Quality Engineering

- **Vitest Unit & Integration Test Suite**:
  - **8 Test Suites**, **67 Unit & Integration Tests** passing at 100%.
  - Run via `npm test`.
- **Test Coverage Areas**:
  - **`__tests__/api/ads.test.ts`**: Tests `GET`, `POST`, `PATCH`, and `DELETE` flows on `/api/ads`.
  - **`__tests__/api/auth-passcode.test.ts`**: Tests passcode updates, admin overrides, and formula-based resets.
  - **`__tests__/lib/settings-manager.test.ts`**: Tests carousel slide additions, removals, admin banner toggles, and settings persistence.
  - **`__tests__/lib/store-manager.test.ts`**: Tests store approval, rejection, deletion, and reactive state management.
  - **`__tests__/lib/shopify.test.ts`**: Tests domain cleaning, candidate domain generation, and reachability.
  - **`__tests__/lib/utils.test.ts`**: Tests pricing calculations, discount percentages, and string helpers.
  - **`__tests__/lib/email.test.ts`**: Tests OTP generation and verification flows.
  - **`__tests__/components/ListingCard.test.tsx`**: Tests component rendering, discount pill visibility, and stock badges.

---

## 🔮 12. Future Features & Product Roadmap

### AI Product Recommendation Engine (Planned for Vendor Portal)
The following automated intelligence modules are planned for future implementation in the Vendor Dashboard (`/vendor`):
- **1. Dynamic Price & Margin Benchmarks**:
  - Algorithmic evaluation of category demand elasticity to suggest profit-optimized retail prices (e.g. +8% gross margin lifts).
  - 1-click price update mutations pushing changes to the local catalog and Shopify Storefront.
- **2. Inventory Velocity & Stockout Forecasting**:
  - Automated detection of low-stock thresholds (`< 10 units`) with time-to-stockout predictions based on listing view velocity.
  - Automated restock trigger simulations.
- **3. SEO & Discoverability Tag Automation**:
  - Machine learning analysis of trending search queries to suggest high-converting metadata tags (e.g., `#trending2026`, `#bestseller`, `#verified-stock`).
- **4. Automated Cross-Sell & Bundle Suggestions**:
  - Co-occurrence algorithms identifying complementary products across the marketplace to recommend "Frequently Bought Together" bundle packages.

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
