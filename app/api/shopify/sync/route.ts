import { NextRequest, NextResponse } from "next/server";
import { fetchProductsFromShopifyStore } from "@/lib/shopify";
import { prisma } from "@/lib/prisma";

/**
 * Handles POST /api/shopify/sync
 * Body: { myshopifyDomain?: string, domain?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const domain = body.myshopifyDomain || body.domain;

    if (!domain) {
      return NextResponse.json({ error: "Store domain is required to trigger sync." }, { status: 400 });
    }

    console.log(`[Catalog Sync] Live sync requested for store: ${domain}`);

    // Look up merchant in DB if exists to get token/whatsapp
    const existingMerchant = await prisma.merchant.findFirst({
      where: { myshopifyDomain: domain },
    });

    const { merchant, slots, error } = await fetchProductsFromShopifyStore(
      domain,
      existingMerchant?.accessToken || undefined,
      existingMerchant?.whatsappNumber || undefined,
      existingMerchant?.passcode || undefined
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    // Persist or update merchant and listings in PostgreSQL
    const savedMerchant = await prisma.merchant.upsert({
      where: { myshopifyDomain: domain },
      update: {
        totalProducts: slots.length,
        lastWebhookSync: new Date().toLocaleTimeString(),
      },
      create: {
        id: merchant.id,
        name: merchant.name,
        myshopifyDomain: domain,
        status: "ACTIVE",
        totalProducts: slots.length,
        storeLogo: merchant.storeLogo,
        connectedSince: "Recently",
        lastWebhookSync: new Date().toLocaleTimeString(),
      },
    });

    // Save all listings and inventory rows
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      try {
        const savedListing = await prisma.listing.upsert({
          where: { shopifyProductId: slot.shopifyProductId },
          update: {
            title: slot.title,
            description: slot.description,
            category: slot.category,
            price: Number(slot.price),
            compareAtPrice: slot.compareAtPrice ? Number(slot.compareAtPrice) : null,
            shopifyVariantId: slot.shopifyVariantId,
            merchantId: savedMerchant.id,
            tags: slot.tags,
            images: slot.images,
            variants: slot.variants as any,
            sku: slot.sku,
            handle: slot.handle,
            productUrl: slot.productUrl,
          },
          create: {
            id: slot.id,
            slotNumber: slot.slotNumber || `SLOT #${String(i + 1).padStart(3, "0")}`,
            title: slot.title,
            description: slot.description,
            category: slot.category,
            price: Number(slot.price),
            compareAtPrice: slot.compareAtPrice ? Number(slot.compareAtPrice) : null,
            shopifyProductId: slot.shopifyProductId,
            shopifyVariantId: slot.shopifyVariantId,
            merchantId: savedMerchant.id,
            tags: slot.tags,
            images: slot.images,
            variants: slot.variants as any,
            sku: slot.sku,
            handle: slot.handle,
            productUrl: slot.productUrl,
          },
        });

        await prisma.inventory.upsert({
          where: { listingId: savedListing.id },
          update: {
            quantityAvailable: Number(slot.inventoryQuantity || 15),
            isUnknownQuantity: Boolean(slot.isUnknownQuantity),
            status: (slot.status as any) || "AVAILABLE",
            lastSyncedAt: new Date(),
          },
          create: {
            listingId: savedListing.id,
            quantityAvailable: Number(slot.inventoryQuantity || 15),
            isUnknownQuantity: Boolean(slot.isUnknownQuantity),
            status: (slot.status as any) || "AVAILABLE",
          },
        });
      } catch (e) {
        console.warn(`[Sync API] Listing upsert warning for "${slot.title}":`, e);
      }
    }

    return NextResponse.json({
      success: true,
      domain,
      syncedSlotsCount: slots.length,
      timestamp: new Date().toISOString(),
      slots,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sync catalog";
    console.error("Catalog Sync Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
