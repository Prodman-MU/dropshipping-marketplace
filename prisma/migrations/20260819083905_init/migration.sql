-- CreateEnum
CREATE TYPE "MerchantStatus" AS ENUM ('ACTIVE', 'PENDING', 'REJECTED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD');

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "name" TEXT NOT NULL,
    "myshopifyDomain" TEXT NOT NULL,
    "accessToken" TEXT,
    "status" "MerchantStatus" NOT NULL DEFAULT 'PENDING',
    "storeLogo" TEXT,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "whatsappNumber" TEXT,
    "passcode" TEXT,
    "connectedSince" TEXT,
    "lastWebhookSync" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "slotNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "shopifyProductId" TEXT NOT NULL,
    "shopifyVariantId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "tags" TEXT[],
    "images" TEXT[],
    "variants" JSONB,
    "sku" TEXT,
    "handle" TEXT,
    "productUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "quantityAvailable" INTEGER NOT NULL DEFAULT 0,
    "isUnknownQuantity" BOOLEAN NOT NULL DEFAULT false,
    "status" "ListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "dropshippingYear" TEXT NOT NULL DEFAULT '2026',
    "siteTitle" TEXT NOT NULL DEFAULT 'MASTERS UNION',
    "announcementText" TEXT NOT NULL DEFAULT '2026 B2B DIRECT DROPSHIPPING CATALOG',
    "catalogBadgeText" TEXT NOT NULL DEFAULT 'OFFICIAL CATALOG',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchants_supabaseUserId_key" ON "merchants"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "merchants_myshopifyDomain_key" ON "merchants"("myshopifyDomain");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slotNumber_key" ON "listings"("slotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "listings_shopifyProductId_key" ON "listings"("shopifyProductId");

-- CreateIndex
CREATE INDEX "listings_merchantId_category_idx" ON "listings"("merchantId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_listingId_key" ON "inventory"("listingId");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
