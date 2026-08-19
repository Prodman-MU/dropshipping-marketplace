/**
 * @file seed.ts (under prisma/)
 * @description Local Development Seeding Pipeline with Mock Merchants & Products.
 * 
 * Populates a fresh local PostgreSQL database with:
 * 1. Default global site settings (via shared `seedSiteSettings()`).
 * 2. Mock merchant vendors (Apex Gear, Threads & Co, Tech Vault).
 * 3. Standardized catalog listings across multiple categories with variants and wholesale pricing.
 * 4. Decoupled inventory records with real-time stock levels and unknown quantity fallbacks.
 * 
 * Uses Prisma upserts (`where: { ... }`) to ensure safe, idempotent execution.
 */

import { MerchantStatus, ListingStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { seedSiteSettings } from "./seed-settings";

async function main() {
  console.log("🌱 Starting Local Database Seeding Pipeline...");

  // ----------------------------------------------------------------------------
  // 1. Seed Global Website & Branding Settings (Shared)
  // ----------------------------------------------------------------------------
  await seedSiteSettings();

  // ----------------------------------------------------------------------------
  // 2. Seed Mock Merchant Vendors
  // ----------------------------------------------------------------------------
  const apexMerchant = await prisma.merchant.upsert({
    where: { myshopifyDomain: "apex-gear.myshopify.com" },
    update: {},
    create: {
      id: "m-001",
      name: "Apex Gear",
      myshopifyDomain: "apex-gear.myshopify.com",
      status: MerchantStatus.ACTIVE,
      storeLogo: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=80",
      totalProducts: 4,
      passcode: "apex123",
      connectedSince: "Feb 10, 2026",
    },
  });

  const threadsMerchant = await prisma.merchant.upsert({
    where: { myshopifyDomain: "threads-co.myshopify.com" },
    update: {},
    create: {
      id: "m-002",
      name: "Threads & Co",
      myshopifyDomain: "threads-co.myshopify.com",
      status: MerchantStatus.ACTIVE,
      storeLogo: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&auto=format&fit=crop&q=80",
      totalProducts: 3,
      passcode: "threads123",
      connectedSince: "Feb 10, 2026",
    },
  });

  const techMerchant = await prisma.merchant.upsert({
    where: { myshopifyDomain: "tech-vault.myshopify.com" },
    update: {},
    create: {
      id: "m-003",
      name: "Tech Vault",
      myshopifyDomain: "tech-vault.myshopify.com",
      status: MerchantStatus.PENDING,
      storeLogo: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&auto=format&fit=crop&q=80",
      totalProducts: 2,
      passcode: "tech123",
      connectedSince: "Feb 10, 2026",
    },
  });

  // ----------------------------------------------------------------------------
  // 3. Seed Catalog Listings & Decoupled Inventory
  // ----------------------------------------------------------------------------
  await prisma.listing.upsert({
    where: { slotNumber: "SLOT #001" },
    update: {},
    create: {
      id: "slot-001",
      slotNumber: "SLOT #001",
      title: "Tactical Modular Backpack",
      description:
        "Waterproof 45L high-capacity modular tactical backpack engineered with laser-cut MOLLE webbing, reinforced ergonomic straps, and laptop sleeve.",
      category: "Tactical Tech & EDC",
      price: 4999.0,
      compareAtPrice: 6999.0,
      shopifyProductId: "gid://shopify/Product/8001001",
      shopifyVariantId: "gid://shopify/ProductVariant/9001001",
      merchantId: apexMerchant.id,
      tags: ["bestseller", "trending2026", "verified-stock"],
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
      ],
      sku: "APX-TAC-45L",
      variants: [
        { id: "v-001", title: "Matte Black", price: 4999.0, sku: "APX-TAC-BLK", inventoryQuantity: 18, availableForSale: true },
        { id: "v-002", title: "Coyote Tan", price: 4999.0, sku: "APX-TAC-TAN", inventoryQuantity: 10, availableForSale: true },
      ],
      inventory: {
        create: {
          quantityAvailable: 28,
          isUnknownQuantity: false,
          status: ListingStatus.AVAILABLE,
        },
      },
    },
  });

  await prisma.listing.upsert({
    where: { slotNumber: "SLOT #002" },
    update: {},
    create: {
      id: "slot-002",
      slotNumber: "SLOT #002",
      title: "Bauhaus Minimalist Chronograph",
      description:
        "Sleek industrial design wrist watch featuring sapphire crystal glass, matte black stainless steel case, and genuine Italian leather band.",
      category: "Apparel & Accessories",
      price: 7499.0,
      compareAtPrice: 9999.0,
      shopifyProductId: "gid://shopify/Product/8001002",
      shopifyVariantId: "gid://shopify/ProductVariant/9001002",
      merchantId: threadsMerchant.id,
      tags: ["trending2026", "premium"],
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      ],
      sku: "THR-BAU-WCH",
      variants: [
        { id: "v-003", title: "Silver Dial / Black Strap", price: 7499.0, sku: "THR-BAU-SLV", inventoryQuantity: 14, availableForSale: true },
      ],
      inventory: {
        create: {
          quantityAvailable: 14,
          isUnknownQuantity: false,
          status: ListingStatus.AVAILABLE,
        },
      },
    },
  });

  await prisma.listing.upsert({
    where: { slotNumber: "SLOT #003" },
    update: {},
    create: {
      id: "slot-003",
      slotNumber: "SLOT #003",
      title: "Cyberpunk Mechanical Keyboard",
      description:
        "Hot-swappable gasket-mounted 75% wireless mechanical keyboard with customizable RGB backlighting, PBT keycaps, and linear yellow switches.",
      category: "Tactical Tech & EDC",
      price: 8999.0,
      compareAtPrice: 11999.0,
      shopifyProductId: "gid://shopify/Product/8001003",
      shopifyVariantId: "gid://shopify/ProductVariant/9001003",
      merchantId: techMerchant.id,
      tags: ["verified-stock"],
      images: [
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      ],
      sku: "TCH-CYB-75K",
      variants: [
        { id: "v-004", title: "Industrial Gray", price: 8999.0, sku: "TCH-CYB-GRY", inventoryQuantity: 0, availableForSale: false },
      ],
      inventory: {
        create: {
          quantityAvailable: 0,
          isUnknownQuantity: true,
          status: ListingStatus.RESERVED,
        },
      },
    },
  });

  console.log("✅ Local seeding complete! Populated site settings, merchants, and product slots.");
}

main()
  .catch((e) => {
    console.error("❌ Error during local database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
