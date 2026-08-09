import { NextRequest, NextResponse } from "next/server";
import { fetchProductsFromShopifyStore } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { domain, token } = body;

    if (!domain) {
      return NextResponse.json({ error: "Shopify domain is required." }, { status: 400 });
    }

    console.log(`[Store Connect API] Request received for domain: ${domain}`);

    const { merchant, slots, error } = await fetchProductsFromShopifyStore(domain, token);

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
  } catch (error: any) {
    console.error("Store Connect API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to connect Shopify store." }, { status: 500 });
  }
}
