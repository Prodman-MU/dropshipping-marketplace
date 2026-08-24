# Gallery-Grade Marketplace: Site Design Theme Specification
### Design Architecture: Apple Store × MR PORTER × Grailed

This document specifies the complete visual architecture, design philosophy, design tokens, typography rules, component patterns, and micro-interaction specifications for the **Masters' Union Dropshipping Marketplace**.

---

## 🏛️ 1. Architectural Precedents & Design Philosophy

The marketplace visual language is constructed from three distinct high-end design systems:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MODERN GALLERY DESIGN SYSTEM                          │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│     APPLE STORE      │      MR PORTER       │            GRAILED            │
│ (Spatial & Hardware) │     (Editorial)      │          (Inventory)          │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ • Pure White Canvas  │ • Playfair Headlines │ • Zero-Border Product Grid    │
│ • Frosted Glass Bar  │ • Breakout Story Box │ • Monospace Micro-Data Tags   │
│ • Studio Photo Boxes │ • Asymmetric Columns │ • Dynamic Discount % Badges   │
│ • Matte Black Pills  │ • Refined Margins    │ • Minimalist Filter Drawer    │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

### Core Principles:
1. **Zero-Border Spatial Layout (Grailed):** Eliminate heavy dark borders and drop shadows. Product containers are borderless; imagery and typography define the grid rhythm naturally.
2. **Studio Neutral Framing (Apple Store):** Product photography is staged against neutral studio backdrops (`#F5F5F7`) with gentle corner radius (`rounded-2xl`).
3. **Editorial Hierarchy (MR PORTER):** High-contrast serif headlines create magazine-grade collection pacing, paired with clean geometric sans for UI controls.
4. **Tactile Frosted Surfaces (Apple Store):** Navigation headers and popup modals utilize translucent backdrop blurs (`backdrop-blur-md` to `backdrop-blur-xl`) with hairline borders.

---

## 🎨 2. Color Palette & Token Architecture

The design token system is defined in [`app/globals.css`](file:///d:/lab/projects/dropshipping-marketplace/app/globals.css) and [`tailwind.config.ts`](file:///d:/lab/projects/dropshipping-marketplace/tailwind.config.ts):

| Token Name | Hex Value / Variable | Purpose / UI Application |
|---|---|---|
| `--color-canvas` | `#FFFFFF` | Primary marketplace page background |
| `--color-surface-subtle` | `#F8F9FA` | Off-white cards, hero breakout frames, KPI containers |
| `--color-surface-muted` | `#F4F4F5` | Secondary controls, pill track backgrounds |
| `--color-surface-studio` | `#F5F5F7` | Neutral studio backdrop for product photography |
| `--color-text-primary` | `#111111` | Primary body typography, high-contrast titles |
| `--color-text-secondary` | `#666666` | Secondary descriptive text and specifications |
| `--color-text-muted` | `#8E8E93` | Tertiary micro-copy, timestamps, SKU labels |
| `--color-border-hairline`| `#E5E7EB` (80%) | 1px hairline card borders and horizontal separators |
| `--color-accent-discount`| `#059669` / `#10B981` | Emerald green discount % badges (`-35%`, `35% OFF`) |
| `--color-pill-primary` | `#000000` | Matte black pill action buttons (`pill-btn-primary`) |

---

## ✒️ 3. Typography System

The application loads three curated typefaces via `next/font/google` in [`app/layout.tsx`](file:///d:/lab/projects/dropshipping-marketplace/app/layout.tsx):

```typescript
// 1. Primary UI Sans-Serif
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// 2. High-Contrast Editorial Serif
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// 3. Micro-Data Monospace
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

### Hierarchy Breakdown:
* **Editorial Headlines (`font-editorial` / Playfair Display):**
  - Hero campaign titles (`36px`–`64px`, `font-normal`, `tracking-tight`)
  - Product Detail Page titles (`28px`–`36px`)
  - Modal headers & section banners
* **UI Sans-Serif (`font-sans` / Inter):**
  - Navigation controls, search inputs, spec accordions, and pricing amounts (`14px`–`16px`)
  - Paragraph body copy (`13px`–`15px`, `leading-relaxed`)
* **Micro-Data Tags (`font-mono` / JetBrains Mono):**
  - Brand badges, SKUs, category indicators, inventory stock indicators, webhook sync timestamps (`10px`–`11px`, `uppercase`, `tracking-wider`, `font-semibold`)

---

## 🧩 4. Component Design Specifications

### 1. Sticky Frosted Glass Navigation Bar ([`components/Header.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/Header.tsx))
* **Container:** `sticky top-0 z-40 w-full glass-header` with `backdrop-filter: blur(16px)` and hairline bottom border (`border-b border-neutral-200/70`).
* **Logo Lockup:** Solid black box (`rounded-xl bg-black px-3.5 py-2`) featuring the animated GIF logo (`/assets/logoanimationblack.gif`) and `/ DROPSHIPPING 2026` in monospace typography.
* **Layout:** Streamlined and distraction-free navigation.

### 2. Editorial Hero & Animated Squiggle Carousel ([`components/Hero.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/Hero.tsx))
* **Framing:** Large off-white container (`bg-[#F8F9FA] rounded-2xl sm:rounded-3xl border border-neutral-200/70 p-6 sm:p-10`).
* **Animated Squiggle Slide:** Centered Masters' Union brand lockup + multi-color linear gradient SVG drawing and erasing continuously with smooth ease-in-out timing.
* **Navigation:** Hairline progress bar (`5.6s` animation cycle), active pill indicators, and smooth Framer Motion slide transitions.

### 3. Zero-Border Product Card ([`components/ListingCard.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/ListingCard.tsx))
* **Photography Box:** Neutral studio image backdrop (`#F5F5F7`), `aspect-[4/5]`, subtle hover scale (`scale-104`), and automatic secondary image reveal on hover.
* **Badging:** 
  - Status pill in top-left corner (`CURATED DROP`, `ARCHIVE`, `SOLD OUT`).
  - Discount pill in top-right corner (`-35%`) when `compareAtPrice > price`.
* **Quick View Action:** Matte black pill button (`pill-btn-primary`) that slides up smoothly upon desktop hover.
* **Pricing Line:** Clean wholesale price, slashed comparison price, and green `{discount}% OFF` micro-tag.

### 4. Control Bar & Slide-Over Filter Drawer ([`components/VendorFilterBar.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/VendorFilterBar.tsx))
* **Horizontal Category Rail:** Pill buttons with active indicator (`bg-black text-white` vs `bg-neutral-100 text-neutral-700`).
* **Search & Sort:** Rounded search input (`rounded-full`) and sort dropdown.
* **Slide-Over Drawer:** Right-side slide-over panel with store checklists, category filters, and matte black "Show Results" button.

### 5. Product Detail Page ([`app/product/[id]/page.tsx`](file:///d:/lab/projects/dropshipping-marketplace/app/product/[id]/page.tsx))
* **2-Column Asymmetric Grid:**
  - **Left (58%):** Vertical studio image roll with thumbnail selector.
  - **Right (42% Sticky):** Playfair title, brand lockup, wholesale pricing, discount % callout, variant pills, primary Shopify Store Checkout CTA, secondary WhatsApp inquiry button, and collapsible spec accordions with clickable merchant storefront links.
* **Bottom Showcase:** "More Products from [Vendor Name]" same-vendor curated showcase.

### 6. Admin & Vendor Desks ([`app/admin/page.tsx`](file:///d:/lab/projects/dropshipping-marketplace/app/admin/page.tsx) & [`app/vendor/page.tsx`](file:///d:/lab/projects/dropshipping-marketplace/app/vendor/page.tsx))
* **Access Gates:** Clean centered authentication cards with circular lock badges and matte black pill buttons.
* **KPI Metrics:** 4-card grids on `#F8F9FA` backgrounds with hairline borders.
* **Tables:** Clean zero-border tables with status pills and specification inspection modals.

---

## ⚡ 5. Micro-Interactions & Animation Specs

```css
/* Gallery Pill Button Physics */
.pill-btn-primary {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.pill-btn-primary:hover {
  background-color: #1C1C1E;
  transform: scale(1.01);
}
.pill-btn-primary:active {
  transform: scale(0.98);
}

/* Card Hover Image Scale */
.product-image {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.group:hover .product-image {
  transform: scale(1.04);
}
```

---

## 📱 6. Responsive Viewport Adaptations

| Viewport Breakpoint | Columns | Container Behavior |
|---|---|---|
| **Mobile (`< 640px`)** | 2 Columns | Tight gap (`gap-3`), horizontal scrollable pill rails, full-width drawers |
| **Tablet (`640px–1024px`)** | 2–3 Columns | Moderate padding (`px-6`), 2-column detail sheets |
| **Desktop (`> 1024px`)** | 4 Columns | Max width `1440px`, 4-column product grid, sticky purchase sidebar |
