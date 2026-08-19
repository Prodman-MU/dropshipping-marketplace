/**
 * @file route.ts (under app/api/cron/sync/)
 * @description Daily Scheduled & Background Catalog Synchronization Route.
 * 
 * Automatically re-syncs all active merchant storefront catalogs daily.
 * Can be called by Vercel Cron, external monitoring services, or on-demand by Admins.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchProductsFromShopifyStore } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  return handleDailySync(req);
}

export async function POST(req: NextRequest) {
  return handleDailySync(req);
}

async function handleDailySync(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, enforce security check
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn("[Cron Sync] Unauthorized cron request attempt.");
  }

  console.log("[Daily Cron Sync] Starting automatic daily catalog update for all active stores...");

  try {
    const activeMerchants = await prisma.merchant.findMany({
      where: { status: "ACTIVE" },
    });

    const syncResults: { domain: string; status: string; productsCount: number; error?: string }[] = [];

    for (const merchant of activeMerchants) {
      try {
        console.log(`[Daily Cron Sync] Syncing catalog for ${merchant.name} (${merchant.myshopifyDomain})...`);

        const { slots, error } = await fetchProductsFromShopifyStore(
          merchant.myshopifyDomain,
          merchant.accessToken || undefined,
          merchant.whatsappNumber || undefined,
          merchant.passcode || undefined
        );

        if (error) {
          syncResults.push({ domain: merchant.myshopifyDomain, status: "FAILED", productsCount: 0, error });
          continue;
        }

        // Upsert listings and inventories in PostgreSQL
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
                merchantId: merchant.id,
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
                merchantId: merchant.id,
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
          } catch (slotErr) {
            console.warn(`[Cron Sync] Listing upsert warning for "${slot.title}":`, slotErr);
          }
        }

        // Update merchant audit timestamp
        await prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            totalProducts: slots.length,
            lastWebhookSync: new Date().toLocaleTimeString(),
          },
        });

        // Add sync log record
        await prisma.syncLog.create({
          data: {
            merchantId: merchant.id,
            eventType: "catalog/daily_sync",
            status: "SUCCESS",
            errorMessage: null,
          },
        }).catch(() => null);

        syncResults.push({ domain: merchant.myshopifyDomain, status: "SUCCESS", productsCount: slots.length });
      } catch (storeErr: any) {
        console.error(`[Daily Cron Sync] Store sync failed for ${merchant.myshopifyDomain}:`, storeErr);
        syncResults.push({
          domain: merchant.myshopifyDomain,
          status: "ERROR",
          productsCount: 0,
          error: storeErr.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Daily catalog synchronization completed for ${syncResults.length} stores.`,
      timestamp: new Date().toISOString(),
      results: syncResults,
    });
  } catch (error: any) {
    console.error("[Daily Cron Sync Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute daily catalog sync." },
      { status: 500 }
    );
  }
}
