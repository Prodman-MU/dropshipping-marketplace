import { NextRequest, NextResponse } from "next/server";
import { getShopifySlots } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const domain = body.myshopifyDomain || body.domain || "apex-gear.myshopify.com";

    console.log(`[Catalog Sync] Manual sync requested for domain: ${domain}`);

    // Fetch latest catalog slots
    const slots = await getShopifySlots();
    const domainSlots = slots.filter((s) => s.merchant.myshopifyDomain === domain || domain === "all");

    return NextResponse.json({
      success: true,
      domain,
      syncedSlotsCount: domainSlots.length,
      timestamp: new Date().toISOString(),
      slots: domainSlots.map((s) => ({
        slotNumber: s.slotNumber,
        title: s.title,
        price: s.price,
        inventoryQuantity: s.inventoryQuantity,
        sku: s.sku,
        status: s.status,
      })),
    });
  } catch (error: any) {
    console.error("Catalog Sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync catalog" }, { status: 500 });
  }
}
