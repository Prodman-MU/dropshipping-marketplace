# Design System Specification: Cyber Gold & Pure Black

This document outlines the design architecture, color tokens, typography rules, scroll-reactive animation formulas, and component interfaces for the **Masters' Union Dark Mode Marketplace**.

---

## 🎨 1. Theme Tokens & CSS Custom Properties

The system is built on a high-contrast luxury dark theme using pure black `#000000` backgrounds and Cyber Gold / Amber Yellow (`#f59e0b` / `#fbbf24`) accent tokens defined in `app/globals.css`.

### Base Color System

```css
:root {
  /* Surface Palette */
  --bg-obsidian: #000000;       /* Pure black main background */
  --card-surface: #121216;      /* Dark glassmorphic card container */
  --card-elevated: #16161c;     /* Elevated surfaces for drawers & modals */
  
  /* Borders & Cyber Gold Glows */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-glow: rgba(245, 158, 11, 0.4);

  /* Status Badges */
  --color-available: #f59e0b;   /* Amber 500 */
  --color-reserved: #eab308;    /* Yellow 500 */
  --color-sold: #71717a;         /* Zinc 500 */
}
```

### Glassmorphism CSS Utilities

```css
.glass-panel {
  background: rgba(18, 18, 22, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-nav {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  background: rgba(18, 18, 22, 0.9);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover {
  border-color: rgba(245, 158, 11, 0.35);
  box-shadow: 0 0 25px rgba(245, 158, 11, 0.08);
  transform: translateY(-2px);
}
```

---

## ✒️ 2. Monospaced Typography System

Specific metadata elements strictly use monospaced typography (`font-mono`) to evoke a high-tech industrial aesthetic:

| UI Element | Styling & Utility Class | Example Output |
|---|---|---|
| Product Price | `font-mono font-black text-white text-lg` | `$149.00` |
| Available Stock Count | `font-mono font-bold text-amber-400` | `240 Units` |
| Product SKU | `font-mono text-zinc-400 text-xs` | `APX-MAG-CB-10K` |
| Shopify Product GID | `font-mono text-white bg-black/90 font-mono` | `gid://shopify/Product/9842019481` |
| Webhook Timestamps | `font-mono text-zinc-500 text-[11px]` | `2026-08-08 15:58:12` |

---

## 🌌 3. Scrollable Ambient Background Video Canvas ([`components/BackgroundVideo.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/BackgroundVideo.tsx))

The ambient background video component uses Framer Motion `useScroll` and `useTransform` to dynamically react to the vertical scroll position:

### Positioning & Opacity Transforms

```typescript
/* File: components/BackgroundVideo.tsx (Line 21) */
// top-20 dictates video top offset (80px header height offset)
<div className="fixed inset-x-0 top-20 bottom-0 pointer-events-none z-0 overflow-hidden select-none">

// Scroll Y transforms: starts at 100% full original brightness (1.0) and smoothly dims on scroll
const { scrollY } = useScroll();
const videoOpacity = useTransform(scrollY, [0, 600, 1200], [1.0, 0.75, 0.35]);
const videoScale = useTransform(scrollY, [0, 1000], [1, 1.05]);
```

---

## 🧩 4. Component Interface Reference

### `Header` Props Interface
```typescript
interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeVendorCount: number;
  totalSyncedProducts: number;
  isVideoEnabled: boolean;
  onToggleVideo: () => void;
  onAddStore: (domain: string) => void;
}
```

### `VendorFilterBar` Props Interface
```typescript
interface VendorFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  vendors: MerchantVendor[];
  selectedVendorId: string;
  onSelectVendor: (id: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: string[];
  totalResultsCount: number;
}
```

### `ListingCard` Props Interface
```typescript
interface ListingCardProps {
  slot: SlotListing;
  onSelect: (slot: SlotListing) => void;
}
```

### `ListingDrawer` Props Interface
```typescript
interface ListingDrawerProps {
  slot: SlotListing | null;
  onClose: () => void;
}
```
