/**
 * @file route.ts (under app/api/listings/)
 * @description Catalog Listings CRUD & Synchronization Endpoint.
 * 
 * Fetches listings with inventory and fulfilling merchant relations from PostgreSQL.
 * Supports updating price, tags, and status on catalog slots.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SlotListing } from "@/data/mock-slots";
import { fetchProductsFromShopifyStore } from "@/lib/shopify";

/**
 * Handles GET /api/listings
 * Query parameters:
 * - status: "ACTIVE" | "PENDING" | "REJECTED" | "ALL" (filters by merchant status, default "ACTIVE")
 * - merchantId: filter by specific merchant UUID
 * - domain: filter by merchant's myshopify domain
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const merchantId = searchParams.get("merchantId");
    const domain = searchParams.get("domain");

    const whereClause: any = {};

    if (merchantId) {
      whereClause.merchantId = merchantId;
    } else if (domain) {
      whereClause.merchant = { myshopifyDomain: domain };
    }

    if (status !== "ALL") {
      whereClause.merchant = {
        ...(whereClause.merchant || {}),
        status: status as any,
      };
    }

    let listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        merchant: true,
        inventory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If no listings in DB or merchants have 0 listings, query the vendor's Shopify store directly and ingest
    if (listings.length === 0) {
      const merchantWhere: any = {};
      if (merchantId) merchantWhere.id = merchantId;
      else if (domain) merchantWhere.myshopifyDomain = domain;
      if (status !== "ALL") merchantWhere.status = status as any;

      const registeredMerchants = await prisma.merchant.findMany({
        where: merchantWhere,
      });

      for (const m of registeredMerchants) {
        try {
          const { slots: fetchedSlots, error } = await fetchProductsFromShopifyStore(
            m.myshopifyDomain,
            m.accessToken || undefined,
            m.whatsappNumber || undefined,
            m.passcode || undefined
          );

          if (!error && fetchedSlots.length > 0) {
            for (let i = 0; i < fetchedSlots.length; i++) {
              const slot = fetchedSlots[i];
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
                    merchantId: m.id,
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
                    merchantId: m.id,
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
              } catch (listingErr) {
                console.warn(`[Auto-Ingest] Listing upsert warning:`, listingErr);
              }
            }

            await prisma.merchant.update({
              where: { id: m.id },
              data: { totalProducts: fetchedSlots.length },
            });
          }
        } catch (fetchErr) {
          console.warn(`[Listings Auto-Sync] Could not ingest from ${m.myshopifyDomain}:`, fetchErr);
        }
      }

      // Re-query listings from database after auto-ingestion
      listings = await prisma.listing.findMany({
        where: whereClause,
        include: {
          merchant: true,
          inventory: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Format Prisma records into SlotListing interface
    const formattedSlots: SlotListing[] = listings.map((l) => {
      const inv = l.inventory;
      const isUnknownQuantity = inv ? inv.isUnknownQuantity : false;
      const inventoryQuantity = inv ? inv.quantityAvailable : 15;
      const listingStatus = inv ? inv.status : (inventoryQuantity > 0 ? "AVAILABLE" : "SOLD");

      return {
        id: l.id,
        slotNumber: l.slotNumber,
        title: l.title,
        description: l.description,
        category: l.category,
        price: l.price,
        compareAtPrice: l.compareAtPrice ?? undefined,
        currencyCode: "INR",
        inventoryQuantity,
        isUnknownQuantity,
        status: listingStatus as any,
        shopifyProductId: l.shopifyProductId,
        shopifyVariantId: l.shopifyVariantId,
        merchant: {
          id: l.merchant.id,
          name: l.merchant.name,
          myshopifyDomain: l.merchant.myshopifyDomain,
          storeLogo: l.merchant.storeLogo || "",
          status: l.merchant.status as any,
          totalProducts: l.merchant.totalProducts,
          connectedSince: l.merchant.connectedSince || "Recently",
          lastWebhookSync: l.merchant.lastWebhookSync || "Just now",
          whatsappNumber: l.merchant.whatsappNumber || undefined,
          passcode: l.merchant.passcode || undefined,
        },
        tags: l.tags || [],
        images: l.images || [],
        variants: (l.variants as any) || [],
        sku: l.sku || "",
        handle: l.handle || "",
        productUrl: l.productUrl || "",
        createdAt: l.createdAt.toISOString(),
        syncLogs: [],
      };
    });

    return NextResponse.json({
      success: true,
      count: formattedSlots.length,
      slots: formattedSlots,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch listings";
    console.error("Fetch Listings Error:", error);
    return NextResponse.json({ error: message, slots: [] }, { status: 500 });
  }
}

/**
 * Handles PATCH /api/listings
 * Body: { id: string, price?: number, tags?: string[], status?: "AVAILABLE" | "RESERVED" | "SOLD", inventoryQuantity?: number }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, price, tags, status, inventoryQuantity } = body;

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required." }, { status: 400 });
    }

    const existingListing = await prisma.listing.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing not found in database." }, { status: 404 });
    }

    // Update Listing fields
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(tags !== undefined ? { tags } : {}),
      },
    });

    // Update Inventory fields if present
    if (status !== undefined || inventoryQuantity !== undefined) {
      if (existingListing.inventory) {
        await prisma.inventory.update({
          where: { listingId: id },
          data: {
            ...(status !== undefined ? { status: status as any } : {}),
            ...(inventoryQuantity !== undefined ? { quantityAvailable: Number(inventoryQuantity) } : {}),
            lastSyncedAt: new Date(),
          },
        });
      } else {
        await prisma.inventory.create({
          data: {
            listingId: id,
            status: status ? (status as any) : "AVAILABLE",
            quantityAvailable: inventoryQuantity !== undefined ? Number(inventoryQuantity) : 15,
            isUnknownQuantity: false,
          },
        });
      }
    }

    console.log(`[Listing Update] Updated listing "${updatedListing.title}" (ID: ${id})`);

    return NextResponse.json({
      success: true,
      message: `Listing "${updatedListing.title}" updated successfully.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update listing";
    console.error("Update Listing Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
