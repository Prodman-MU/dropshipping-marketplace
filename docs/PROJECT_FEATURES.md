# Project Feature Specifications & Product Management Matrix
### Masters' Union Shopify Multi-Vendor Dropshipping Marketplace

> **Dual-Perspective Specification**: This document details the functional specifications, business logic, safety guardrails, user experiences, and technical APIs for each core feature from both a **Full-Stack Developer** and an **AI Product Manager** perspective.

---

## 📌 Feature Matrix Overview

| Feature Module | Product Manager (User & SLA Impact) | Developer (Architecture & APIs) |
| :--- | :--- | :--- |
| **1. Contained Ambient Hero Video Card** | Elevates visual brand identity while containing video to the hero card, eliminating full-page scroll visual noise. | `BackgroundVideo.tsx` embedded in `Hero.tsx` (`rounded-3xl`, relative container, lightened tints, floating toggle controls). |
| **2. Sticky Left Filter Sidebar** | Reclaims vertical viewport height, keeping filter controls sticky and accessible alongside product listings. | `VendorFilterBar.tsx` converted to vertical left pane (`w-full lg:w-72`), category selector converted to `<select>` dropdown. |
| **3. High-Contrast Product Grid** | Framed in vibrant `#FFE082` yellow container with solid obsidian dark cards for high visual legibility across all screens. | `app/page.tsx` grid wrapper (`bg-[#FFE082] rounded-3xl p-6 sm:p-8`), `ListingCard.tsx` (`bg-zinc-950/95 border-zinc-800`). |
| **4. Product Details Popup Drawer** | Features Masters Union logo animation in drawer header alongside availability status badges (`AVAILABLE`, `RESERVED`, `SOLD OUT`). | `ListingDrawer.tsx` header with `/assets/logoanimationblack.gif`, variant selectors, wholesale pricing callout, and WhatsApp B2B CTA. |
| **5. Shopify Custom Domain Scraper** | Onboards storefronts in `< 1.0s` with candidate URL discovery (`cleanStoreDomain` fallback physics). | `POST /api/shopify/connect` calling `getDomainCandidates()`, normalization, and Prisma database upserting. |
| **6. Multi-Tenant Vendor Security** | Prevents spam via mandatory `PENDING` moderation state; protects store data via store-isolated passcodes (`authorizedStoreId`). | Store-scoped auth session tokens, `vendorPasscode` column in `merchants` table, IDOR API validation guards. |
| **7. Transactional Email & Admin OTP 2FA** | Guards administrative actions via dynamic passcodes + 10-minute single-use email OTP verification. | Nodemailer / SMTP transport dispatch (`/api/auth/admin/send-otp`), local Inbucket mailbox (`:54324`), `admin_otps` table. |
| **8. Stream-Level Webhook Ingestion** | Prevents webhook signature rejection by validating HMAC digests against raw wire bytes (`req.text()`). | `POST /api/webhooks/shopify` preserving raw body stream before `JSON.parse()`. |

---

## 1. Contained Hero Ambient Background Video Card

### Product Manager Perspective
- **User Value**: Presents a gallery-grade visual introduction without overwhelming product browsing or degrading scroll performance.
- **Product SLA**: Video is contained inside a rounded card in the hero section, keeping product cards clean and readable.
- **Controls**: Includes accessible floating controls (Video ON/OFF toggle, Play/Pause) in the bottom-right corner.

### Developer Perspective
- **Component File**: [`components/BackgroundVideo.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/BackgroundVideo.tsx) & [`components/Hero.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/Hero.tsx)
- **Positioning**: Scoped container styling (`relative w-full h-full rounded-3xl overflow-hidden`).
- **Gradient Tints**: Lightened dark gradient overlay tints (`from-black/60 via-transparent to-black/20`) for full video visual fidelity.

---

## 2. Sticky Left Filter Sidebar & Category Dropdown

### Product Manager Perspective
- **User Value**: Re-architected top filter bar into a sticky vertical left pane (`VendorFilterBar`), freeing up vertical space for product listings.
- **UX Ergonomics**: Converted long category button lists into a native `<select>` dropdown menu to prevent excessive sidebar height as categories grow.

### Developer Perspective
- **Component File**: [`components/VendorFilterBar.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/VendorFilterBar.tsx) & [`app/page.tsx`](file:///d:/lab/projects/dropshipping-marketplace/app/page.tsx)
- **Layout Architecture**: 2-column flex layout (`flex flex-col lg:flex-row gap-8 items-start`), positioning `VendorFilterBar` in left column (`w-full lg:w-72 shrink-0`).
- **Controls**: Contains search input, category `<select>`, vendor store `<select>`, sort selector, matching item count badge, and 1-click filter reset button.

---

## 3. High-Contrast `#FFE082` Product Grid & Obsidian Cards

### Product Manager Perspective
- **User Value**: Establishes vibrant visual separation between the product section and the dark page canvas.
- **Contrast Ergonomics**: Tested and selected `#FFE082` hex backdrop paired with solid obsidian dark cards (`bg-zinc-950/95`) to guarantee text, price tags, and vendor badges are 100% legible across OLED, IPS, and mobile screens.

### Developer Perspective
- **Component File**: [`app/page.tsx`](file:///d:/lab/projects/dropshipping-marketplace/app/page.tsx) & [`components/ListingCard.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/ListingCard.tsx)
- **Grid Wrapper**: `bg-[#FFE082] rounded-3xl p-6 sm:p-8 border border-[#FFE082]/50 shadow-2xl`.
- **Card Styling**: `bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-xl text-white`.

---

## 4. Product Details Popup Drawer & Brand Identity

### Product Manager Perspective
- **User Value**: Slide-over drawer enables rapid product inspection without losing scroll position in the marketplace grid.
- **Brand Identity**: Features the animated Masters Union GIF logo (`/assets/logoanimationblack.gif`) in the top-left header alongside live availability status badges (`AVAILABLE`, `RESERVED`, `SOLD OUT`).

### Developer Perspective
- **Component File**: [`components/ListingDrawer.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/ListingDrawer.tsx)
- **Header Structure**: `p-6 border-b border-white/10 bg-black/90 flex items-center justify-between`.
- **Interactions**: Variant selection, discount percentage calculation (`compareAtPrice` vs `price`), wholesale rate callout, and 1-click WhatsApp B2B inquiry CTA.

---

## 5. Automated Shopify Storefront Ingestion

### Product Manager Perspective
- **User Value**: Vendors onboard by providing their store URL (e.g. `https://aavo.store`). The system automatically ingests multi-variant products in `< 1.0s`.
- **Moderation Safety**: All connected stores default to `PENDING` status to prevent spam or unverified catalogs from reaching the public catalog until admin review.

### Developer Perspective
- **API Endpoint**: `POST /api/shopify/connect`
- **Domain Discovery**: `cleanStoreDomain()` normalizes user input; `getDomainCandidates()` tests fallback candidate URLs (`domain.com`, `www.domain.com`, `domain.myshopify.com`).
- **Persistence**: Scraped catalog items are saved to local state and upserted into Supabase PostgreSQL via Prisma ORM 7.

---

## 6. Transactional Email Dispatch & Admin Dual-Factor OTP Verification

### Product Manager Perspective
- **Security SLA**: Prevents brute-force access to administrative actions (store approvals, hero ad banner moderation, site configuration updates) by requiring two-factor authorization.
- **User Experience**: When the admin enters a valid passcode, the system generates a cryptographically secure 6-digit OTP delivered via email within seconds.
- **Single-Use Guardrail**: OTP tokens expire automatically after 10 minutes (`expiresAt = now + 10m`) and are invalidated (`used = true`) immediately upon verification to eliminate replay attack risks.

### Developer Perspective
- **Endpoints**:
  - `POST /api/auth/admin/send-otp`: Generates random 6-digit OTP, inserts record in `admin_otps` Prisma model, and dispatches HTML email via Nodemailer SMTP transport.
  - `POST /api/auth/admin/verify-otp`: Validates code against active database OTPs (`used = false && expiresAt > now`) and marks token as used.
- **Local Mailbox Simulation**: In local development (`NODE_ENV !== 'production'`), emails are routed to the local Supabase Inbucket mailbox container (`http://127.0.0.1:54324`), enabling offline email testing without real SMTP credentials.
- **Database Model**: `AdminOtp` in `prisma/schema.prisma` (`id`, `email`, `otp`, `expiresAt`, `used`, `createdAt`).

