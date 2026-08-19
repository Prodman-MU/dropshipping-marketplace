/**
 * @file route.ts (under app/api/webhooks/shopify/)
 * @description Shopify Real-Time Webhook Ingestion Listener.
 * 
 * Ingests asynchronous Shopify Admin events (product creations, price updates,
 * deletions, and inventory level adjustments).
 * Validates authenticity via HMAC SHA256 signatures before processing payloads.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyShopifyHmac } from "@/lib/shopify";

/**
 * Handles POST /api/webhooks/shopify
 */
export async function POST(req: NextRequest) {
  try {
    const topic = req.headers.get("x-shopify-topic") || "unknown";
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
    const shopDomain = req.headers.get("x-shopify-shop-domain") || "myshopify.com";

    const rawBody = await req.text();

    // Verify HMAC Signature using the shared SHOPIFY_WEBHOOK_SECRET
    const isValid = verifyShopifyHmac(rawBody, hmacHeader);
    if (!isValid) {
      console.warn(`[Shopify Webhook] HMAC verification failed for ${shopDomain}`);
      return NextResponse.json({ error: "Invalid HMAC Signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody || "{}");

    console.log(
      `[Shopify Webhook Ingest] Event: ${topic} | Shop: ${shopDomain} | Entity ID: ${payload.id || "N/A"}`
    );

    // Route event based on Shopify Webhook topic
    let syncAction = "PROCESSED";

    switch (topic) {
      case "products/create":
        console.log(`-> New product slot created: "${payload.title}" (ID: ${payload.id})`);
        syncAction = "PRODUCT_CREATED";
        break;

      case "products/update":
        console.log(
          `-> Product slot updated: "${payload.title}" (Price: ${payload.variants?.[0]?.price || "N/A"})`
        );
        syncAction = "PRODUCT_UPDATED";
        break;

      case "products/delete":
        console.log(`-> Product slot removed (ID: ${payload.id})`);
        syncAction = "PRODUCT_DELETED";
        break;

      case "inventory_levels/update":
        console.log(
          `-> Inventory level update: Item ${payload.inventory_item_id} -> Available: ${payload.available}`
        );
        syncAction = "INVENTORY_UPDATED";
        break;

      default:
        console.log(`-> General webhook event ingested: ${topic}`);
        break;
    }

    return NextResponse.json({
      received: true,
      topic,
      shopDomain,
      syncAction,
      entityId: payload.id || null,
      timestamp: new Date().toISOString(),
      status: "SYNC_LOGGED",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Shopify Webhook Processing Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
