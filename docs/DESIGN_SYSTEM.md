# Design System Specification: Gallery-Grade Marketplace
### Apple Store × MR PORTER × Grailed

This document specifies the design architecture, tokens, typography rules, component interfaces, and micro-interaction guidelines for the **Masters' Union Marketplace**.

---

## 🎨 1. Theme Tokens & CSS Custom Properties

The system is built on a clean, high-contrast gallery aesthetic featuring a pure white `#FFFFFF` canvas, subtle off-white `#F8F9FA` breakout surfaces, neutral studio photography backdrops (`#F5F5F7`), and matte black `#000000` pill controls defined in [`app/globals.css`](file:///d:/lab/projects/dropshipping-marketplace/app/globals.css).

### Base Color System

```css
:root {
  /* Surface Palette */
  --color-canvas: #FFFFFF;
  --color-surface-subtle: #F8F9FA;
  --color-surface-muted: #F4F4F5;
  --color-surface-studio: #F5F5F7;
  
  /* Text Palette */
  --color-text-primary: #111111;
  --color-text-secondary: #666666;
  --color-text-muted: #8E8E93;
  
  /* Borders & Accents */
  --color-border-hairline: #E5E7EB;
  --color-accent-discount: #059669;
}
```

### Frosted Glass & Pill Utilities

```css
.glass-header {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.7);
}

.pill-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  color: #FFFFFF;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.pill-btn-primary:hover {
  background-color: #1C1C1E;
  transform: scale(1.01);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 9999px;
  border: 1px solid #E5E7EB;
  background-color: #FFFFFF;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #111111;
}
```

---

## ✒️ 2. Typography System

| Typeface | Class / Role | Purpose / Application |
|---|---|---|
| **Inter** | `font-sans` | Primary UI typography, buttons, tables, descriptive copy |
| **Playfair Display** | `font-editorial` | High-contrast editorial serif headlines and product titles |
| **JetBrains Mono** | `font-mono` | 11px uppercase metadata tags, SKUs, timestamps, discount % |

---

## 🧩 3. Component Interfaces

### `ListingCard`
```typescript
interface ListingCardProps {
  slot: SlotListing;
  onSelect?: (slot: SlotListing) => void;
}
```
* **Features:** Zero-border card, `#F5F5F7` studio frame, hover image scale & secondary preview, discount badge (`-35%`), slide-up Quick View pill.

### `Hero`
```typescript
interface HeroProps {
  isVideoEnabled?: boolean;
  onToggleVideo?: () => void;
}
```
* **Features:** `#F8F9FA` editorial breakout card, animated SVG squiggle draw animation, slide carousel with hairline progress bar.

### `VendorFilterBar`
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
* **Features:** Horizontal category pill rail, search input, slide-over filter drawer.

### `ListingDrawer`
```typescript
interface ListingDrawerProps {
  slot: SlotListing | null;
  onClose: () => void;
  onSelectRelatedSlot?: (slot: SlotListing) => void;
}
```
* **Features:** Apple Store product sheet modal, variant pill selection, dynamic discount % calculation, wholesale pricing callouts, WhatsApp B2B inquiry integration.
