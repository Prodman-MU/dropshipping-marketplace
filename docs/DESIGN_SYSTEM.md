# Design System & UI/UX Contrast Architecture
### Masters' Union Shopify Multi-Vendor Dropshipping Marketplace

> **Dual-Perspective Specification**: This document specifies the design system tokens, CSS utility classes, hardware-agnostic contrast physics, and component interfaces for both **Full-Stack Developers** building components and **AI Product Managers** evaluating UX ergonomics.

---

## 🎨 Color System & Contrast Physics

### Primary Surface Tokens

| Token Name | Hex / Class | Description | PM Usability & Ergonomics |
| :--- | :--- | :--- | :--- |
| **Grid Backdrop** | `#FFE082` (`bg-[#FFE082]`) | Custom warm yellow backdrop container framing product cards | Visual energy separation between dark canvas and product grid |
| **Obsidian Card Surface** | `#09090B` (`bg-zinc-950/95`) | Solid dark card background with 95% opacity | High contrast for white text, badges, and image thumbnails |
| **Card Border** | `#27272A` (`border-zinc-800`) | Crisp subtle border defining card boundaries | Sharp visual separation on light/yellow backgrounds |
| **Page Base Canvas** | `#000000` (`bg-black`) | Deep obsidian page canvas background | Gallery-grade dark mode aesthetic |
| **Sidebar Filter Surface** | `#18181B` (`bg-zinc-900/90`) | Sticky left sidebar container | Subdued dark surface framing search & `<select>` dropdowns |
| **Accent Gold Badge** | `#F59E0B` (`bg-amber-500`) | Status indicators and highlight pills | High-visibility badge accent color |
| **Discount Pill** | `#10B981` (`bg-emerald-500`) | Discount percentage badges (e.g. `-35% OFF`) | Clear visual incentive callout |

---

## 📐 Typography Hierarchy

| Role | Font Family | Size / Weight | CSS Class |
| :--- | :--- | :--- | :--- |
| **Headline Serif** | `Playfair Display`, serif | `text-3xl sm:text-4xl font-bold` | `font-serif tracking-tight text-white` |
| **Body Sans** | `Inter`, sans-serif | `text-sm sm:text-base font-normal` | `font-sans text-zinc-300 leading-relaxed` |
| **Micro-Data & Badges** | `JetBrains Mono`, monospace | `text-xs font-semibold uppercase` | `font-mono tracking-wider text-amber-400` |
| **Card Product Title** | `Inter`, sans-serif | `text-sm font-semibold` | `font-sans text-white line-clamp-1` |
| **Price Tag** | `JetBrains Mono`, monospace | `text-base font-bold` | `font-mono text-emerald-400` |

---

## 🧩 Component Interfaces & Layout Specifications

### 1. Product Listing Card (`ListingCard.tsx`)
```typescript
interface ListingCardProps {
  listing: SlotListing;
  merchant?: MerchantVendor;
  onSelect: (listing: SlotListing) => void;
  onReserve?: (listing: SlotListing) => void;
}
```
* **Styling**: `bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-500/10 hover:-translate-y-1`.
* **Sub-components**: Image thumbnail container (`aspect-square rounded-xl bg-zinc-900`), vendor domain pill, product title, slashed `compareAtPrice`, current `price`, discount percentage badge, and WhatsApp inquiry button.

### 2. Left Filter Sidebar (`VendorFilterBar.tsx`)
```typescript
interface VendorFilterBarProps {
  merchants: MerchantVendor[];
  categories: string[];
  selectedCategory: string;
  selectedVendor: string;
  searchQuery: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onVendorChange: (vendorId: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
  totalMatchingItems: number;
}
```
* **Layout**: Sticky vertical sidebar pane (`w-full lg:w-72 shrink-0 space-y-6 sticky top-24`).
* **UI Controls**:
  - Search input (`bg-zinc-900 border-zinc-800 text-white rounded-xl`).
  - Category selector converted to native `<select>` dropdown menu.
  - Vendor store selector `<select>` dropdown menu.
  - Sort selector `<select>` dropdown menu.
  - 1-click Filter Reset button and matching item count badge.

### 3. Contained Hero Ambient Video Card (`BackgroundVideo.tsx`)
```typescript
interface BackgroundVideoProps {
  videoUrl?: string;
  fallbackImageUrl?: string;
  isMuted?: boolean;
}
```
* **Positioning**: Scoped hero card container (`relative w-full h-full rounded-3xl overflow-hidden`).
* **Ambient Controls**: Floating video ON/OFF toggle and Play/Pause control positioned in bottom-right corner (`absolute bottom-4 right-4 z-30`).

### 4. Product Details Popup Drawer (`ListingDrawer.tsx`)
```typescript
interface ListingDrawerProps {
  listing: SlotListing | null;
  merchant?: MerchantVendor;
  isOpen: boolean;
  onClose: () => void;
}
```
* **Header**: Animated Masters Union logo (`/assets/logoanimationblack.gif`) embedded in top-left header alongside status badges (`AVAILABLE`, `RESERVED`, `SOLD OUT`).
