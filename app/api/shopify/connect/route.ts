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
