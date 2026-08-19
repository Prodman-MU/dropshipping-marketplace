/**
 * @file route.ts (under app/api/merchants/)
 * @description Merchant CRUD & Cascading Deletion Endpoint.
 * 
 * Handles fetching merchants and permanently deleting stores from PostgreSQL / Supabase.
 * When a merchant is deleted, PostgreSQL's `ON DELETE CASCADE` constraint automatically
 * wipes all associated records from:
 * - `listings` (all catalog product listings belonging to this merchant)
 * - `inventory` (all inventory rows linked to those listings)
 * - `sync_logs` (all audit sync logs for this merchant)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Handles GET /api/merchants
 * Returns all registered merchants from the database with product counts.
 */
export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      merchants,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch merchants";
    console.error("Fetch Merchants Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Handles DELETE /api/merchants?id=... or DELETE /api/merchants?domain=...
 * Permanently removes the merchant and cascades deletion to listings, inventory, and sync logs.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const domain = searchParams.get("domain");

    if (!id && !domain) {
      return NextResponse.json(
        { error: "Must provide either 'id' or 'domain' query parameter to delete a merchant." },
        { status: 400 }
      );
    }

    // Find the target merchant first
    const merchant = await prisma.merchant.findFirst({
      where: id ? { id } : { myshopifyDomain: domain! },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant store not found in database." },
        { status: 404 }
      );
    }

    // Delete the merchant.
    // PostgreSQL Foreign Key CASCADE constraints automatically delete all associated
    // rows in the `listings`, `inventory`, and `sync_logs` tables.
    const deletedMerchant = await prisma.merchant.delete({
      where: { id: merchant.id },
    });

    console.log(`[Merchant Delete] Permanently deleted merchant "${deletedMerchant.name}" (${deletedMerchant.myshopifyDomain}) and cascaded deletions.`);

    return NextResponse.json({
      success: true,
      message: `Merchant "${deletedMerchant.name}" and all associated products, inventory, and sync logs have been permanently deleted.`,
      deletedMerchantId: deletedMerchant.id,
      domain: deletedMerchant.myshopifyDomain,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete merchant";
    console.error("Delete Merchant Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
