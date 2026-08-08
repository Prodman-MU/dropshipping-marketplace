# System Architecture & Technical Specifications

The **DeLorean x Masters' Union Shopify Marketplace Platform** is an institutional multi-vendor product catalog marketplace. It aggregates, normalizes, and lists products and assets from multiple connected Shopify stores via Shopify Storefront GraphQL & Admin Webhook APIs.

---

## 🏛️ 1. High-Level Architecture Overview

The system follows an **Event-Driven Next.js App Router Architecture** integrated with a **PostgreSQL Database managed via Prisma ORM**.

```mermaid
sequenceDiagram
    autonumber
    actor Merchant as Shopify Merchant
    actor Buyer as Marketplace Buyer
    participant App as Next.js App Router
    participant ShopifyAdmin as Shopify Admin API
    participant ShopifySF as Shopify Storefront API
    participant DB as Postgres (Prisma ORM)

    %% Merchant OAuth Connection
    Merchant->>App: Click "Connect Shopify Store"
    App->>ShopifyAdmin: Redirect to OAuth Authorize URL
    Merchant->>ShopifyAdmin: Grant Permissions (read_products, read_inventory)
    ShopifyAdmin->>App: Callback with Authorization Code (/api/shopify/callback)
    App->>ShopifyAdmin: Exchange Code for Access Token
    App->>ShopifyAdmin: Register Webhooks (products/*, inventory_levels/*)
    App->>DB: Save Merchant & Initial SyncLog

    %% Buyer Browsing & Real-Time Sync
    Buyer->>App: Browse Marketplace (app/page.tsx)
    App->>ShopifySF: GraphQL Query (getProducts)
    ShopifySF-->>App: Catalog Data & Inventory Levels
    App-->>Buyer: Render DeLorean Dark Cards (SLOT #001)

    %% Webhook Event Loop
    ShopifyAdmin->>App: Webhook Event (inventory_levels/update)
    App->>App: Verify HMAC SHA256 Signature
    App->>DB: Upsert Listing Slot & Insert SyncLog
```

---

## 🗄️ 2. Comprehensive Database Schema (`prisma/schema.prisma`)

The database uses PostgreSQL with Prisma ORM models designed for fast lookup and relational integrity.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum MerchantStatus {
  ACTIVE
  PENDING
  DISCONNECTED
}

enum ListingStatus {
  AVAILABLE
  RESERVED
  SOLD
}

model Merchant {
  id              String         @id @default(uuid())
  name            String
  myshopifyDomain String         @unique
  accessToken     String?
  status          MerchantStatus @default(PENDING)
  storeLogo       String?
  totalProducts   Int            @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  listings Listing[]
  syncLogs SyncLog[]

  @@map("merchants")
}

model Listing {
  id                String        @id @default(uuid())
  slotNumber        String        @unique // e.g. SLOT #001
  title             String
  description       String        @db.Text
  category          String
  price             Float
  compareAtPrice    Float?
  inventoryQuantity Int           @default(0)
  status            ListingStatus @default(AVAILABLE)
  shopifyProductId  String        @unique
  shopifyVariantId  String
  merchantId        String
  merchant          Merchant      @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  tags              String[]
  images            String[]
  variants          Json?         // JSON array of variant options
  sku               String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@map("listings")
  @@index([category])
  @@index([status])
  @@index([merchantId])
}

model SyncLog {
  id           String   @id @default(uuid())
  merchantId   String
  merchant     Merchant @relation(fields: [merchantId], references: [id], onDelete: Cascade)
  eventType    String   // e.g. products/create, products/update, inventory_levels/update
  status       String   // SUCCESS, FAILED, PENDING
  payload      Json?
  errorMessage String?
  createdAt    DateTime @default(now())

  @@map("sync_logs")
  @@index([merchantId])
  @@index([createdAt])
}
```

---

## 💻 3. Component Hierarchy & State Management

The application is structured cleanly into Server Components and interactive Client Components:

```
app/
 ├── layout.tsx                # Root layout (Metadata, Fonts, Dark Mode Base)
 ├── globals.css               # DeLorean Obsidian tokens & glassmorphism utilities
 ├── page.tsx                  # Main product-centric marketplace page (State Holder)
 └── api/
      ├── shopify/
      │    ├── auth/route.ts   # OAuth Initiation
      │    ├── callback/route.ts# OAuth Code Exchange & Webhook Setup
      │    └── sync/route.ts   # Catalog Re-Sync API
      └── webhooks/
           └── shopify/route.ts# Webhook HMAC verification & ingestion

components/
 ├── Header.tsx                # Glassmorphic navbar with search & store connection trigger
 ├── Hero.tsx                  # Clean editorial headline branding
 ├── VendorFilterBar.tsx       # Dedicated product search bar, category pills, vendor dropdown, sort dropdown
 ├── ListingCard.tsx           # Luxury industrial slot card (SLOT #001, Price, Stock, Variants)
 ├── ListingDrawer.tsx         # Framer Motion 3-Tab slide-out drawer (Specs, Shopify & Stock, Webhooks)
 ├── BackgroundVideo.tsx       # Scroll-reactive ambient video canvas & toggle bar
 └── ConnectStoreModal.tsx     # OAuth store connection modal
```

---

## ⚡ 4. Failure Invariants & Graceful Fallback Strategy

1. **API Offline Fallback**: If Shopify Storefront API credentials are missing or the external API is unreachable, the system automatically falls back to [`data/mock-slots.ts`](file:///d:/lab/projects/dropshipping-marketplace/data/mock-slots.ts) to guarantee zero UI downtime.
2. **HMAC Signature Verification**: Incoming webhook calls without a valid `x-shopify-hmac-sha256` signature header are rejected immediately with HTTP 401.
3. **Database Cascade Safety**: Deleting a `Merchant` cascades deletion to associated `Listing` slots and `SyncLog` audit records.
