# Design System Specification: DeLorean x Masters' Union

This document outlines the design architecture, color tokens, typography rules, scroll-reactive animation formulas, and component interfaces for the **DeLorean x Masters' Union Dark Mode Marketplace**.

---

## 🎨 1. Theme Tokens & CSS Custom Properties

The system is built on a high-contrast luxury industrial dark mode using standard CSS custom properties in `app/globals.css`.

### Base Color System

```css
:root {
  /* Surface Palette */
  --bg-obsidian: #090a0f;       /* Main deep obsidian background */
  --card-surface: #13151d;      /* Card surface container */
  --card-elevated: #181a24;     /* Elevated surfaces for drawers & modals */
  
  /* Borders & Glows */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-glow: rgba(16, 185, 129, 0.4);

  /* Status Badges */
  --color-available: #10b981;   /* Emerald 500 */
  --color-reserved: #f59e0b;    /* Amber 500 */
  --color-sold: #71717a;         /* Zinc 500 */
}
```

### Glassmorphism CSS Utilities

```css
.glass-panel {
  background: rgba(19, 21, 29, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-nav {
  background: rgba(9, 10, 15, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  background: rgba(19, 21, 29, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-card:hover {
  border-color: rgba(16, 185, 129, 0.35);
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.08);
  transform: translateY(-2px);
}
```

---

## ✒️ 2. Monospaced Typography System

To evoke a high-tech DeLorean industrial feel, specific metadata elements strictly use monospaced typography (`font-mono`):

| UI Element | Styling & Utility Class | Example Output |
|---|---|---|
| Slot Number Badge | `font-mono font-black text-emerald-400 font-mono-glow` | `SLOT #001` |
| Product Asking Price | `font-mono font-black text-white text-lg` | `$149.00` |
| Available Stock Count | `font-mono font-bold text-emerald-400` | `240 Units` |
| SKU Identifiers | `font-mono text-zinc-400 text-xs` | `APX-MAG-CB-10K` |
| Shopify Product GID | `font-mono text-white bg-black/60 font-mono` | `gid://shopify/Product/9842019481` |
| Webhook Timestamps | `font-mono text-zinc-500 text-[11px]` | `2026-08-08 15:58:12` |

---

## 🌌 3. Scrollable Ambient Background Video Canvas ([`components/BackgroundVideo.tsx`](file:///d:/lab/projects/dropshipping-marketplace/components/BackgroundVideo.tsx))

The ambient background video component uses Framer Motion `useScroll` and `useTransform` to dynamically react to the user's vertical scroll position:

### Opacity & Parallax Transforms

```typescript
const { scrollY } = useScroll();

// As scroll Y goes from 0px to 1200px, video opacity smoothly dims from 0.45 down to 0.15
const videoOpacity = useTransform(scrollY, [0, 600, 1200], [0.45, 0.25, 0.15]);

// As scroll Y goes from 0px to 1000px, subtle scale effect creates depth parallax
const videoScale = useTransform(scrollY, [0, 1000], [1, 1.08]);
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
