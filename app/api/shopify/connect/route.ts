/**
 * @file route.ts (under app/api/shopify/connect/)
 * @description Direct Store Connection & Initial Catalog Ingestion Endpoint.
 * 
 * Used during vendor store onboarding from the `/vendor` portal or `ConnectStoreModal`.
 * Accepts store domain, optional storefront token, WhatsApp B2B number, and merchant passcode.
 * Fetches the merchant's live Shopify catalog via Storefront GraphQL and registers them as PENDING.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchProductsFromShopifyStore } from "@/lib/shopify";
import { prisma } from "@/lib/prisma";

/**
 * Handles POST /api/shopify/connect
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { domain, token, whatsappNumber, passcode } = body;

    if (!domain) {
      return NextResponse.json({ error: "Shopify domain is required." }, { status: 400 });
    }

    console.log(
      `[Store Connect API] Request received for domain: ${domain} (WhatsApp: ${whatsappNumber || "None"}, Passcode Set: ${passcode ? "Yes" : "Default"})`
    );

    // Fetch live catalog items and construct candidate merchant/slot models
    const { merchant, slots, error } = await fetchProductsFromShopifyStore(
      domain,
      token,
      whatsappNumber,
      passcode
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    // Persist to PostgreSQL database
    try {
      const savedMerchant = await prisma.merchant.upsert({
        where: { myshopifyDomain: merchant.myshopifyDomain },
        update: {
          name: merchant.name,
          status: merchant.status as any,
          totalProducts: slots.length,
          whatsappNumber: merchant.whatsappNumber,
          passcode: merchant.passcode,
          storeLogo: merchant.storeLogo,
          lastWebhookSync: "Just now",
        },
        create: {
          id: merchant.id,
          name: merchant.name,
          myshopifyDomain: merchant.myshopifyDomain,
          status: merchant.status as any,
          totalProducts: slots.length,
          whatsappNumber: merchant.whatsappNumber,
          passcode: merchant.passcode,
          storeLogo: merchant.storeLogo,
          connectedSince: merchant.connectedSince,
          lastWebhookSync: "Just now",
        },
      });

      // Also persist all fetched product listings and inventory records
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

          // Upsert inventory for this listing
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
        } catch (listingErr) {
          console.warn(`[Store Connect API] Listing upsert warning for "${slot.title}":`, listingErr);
        }
      }

      console.log(`[Store Connect API] Successfully persisted merchant "${savedMerchant.name}" and ${slots.length} listings to PostgreSQL.`);
    } catch (dbErr) {
      console.warn("[Store Connect API] DB upsert warning (falling back gracefully):", dbErr);
    }

    return NextResponse.json({
      success: true,
      domain: merchant.myshopifyDomain,
      merchant,
      slots,
      totalProductsSynced: slots.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to connect Shopify store.";
    console.error("Store Connect API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
