/**
 * @file route.ts (under app/api/auth/passcode/)
 * @description Vendor & Admin Passcode Management and Reset Endpoint.
 * 
 * Supports operations:
 * 1. `update_vendor_passcode`: Allows a merchant (or admin) to update their store passcode.
 * 2. `reset_vendor_passcode`: Resets a merchant's passcode to default (<prefix>123).
 * 3. `get_admin_default`: Returns whether environment default passcode is configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_ENV_ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "admin123";
const MASTER_VENDOR_PASSCODE = process.env.MASTER_VENDOR_PASSCODE || "vendor123";

/**
 * Handles POST /api/auth/passcode
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, merchantId, domain, currentPasscode, newPasscode, isAdminOverride } = body;

    // --------------------------------------------------------------------------
    // ACTION 1: UPDATE VENDOR PASSCODE
    // --------------------------------------------------------------------------
    if (action === "update_vendor_passcode") {
      if (!merchantId && !domain) {
        return NextResponse.json({ error: "Merchant identifier is required." }, { status: 400 });
      }

      if (!newPasscode || newPasscode.trim().length < 4) {
        return NextResponse.json(
          { error: "New passcode must be at least 4 characters long." },
          { status: 400 }
        );
      }

      // Look up merchant
      const merchant = await prisma.merchant.findFirst({
        where: merchantId ? { id: merchantId } : { myshopifyDomain: domain },
      });

      if (!merchant) {
        return NextResponse.json({ error: "Merchant not found." }, { status: 404 });
      }

      // Check current passcode unless admin override or master key is used
      if (!isAdminOverride) {
        const cleanCurrent = (currentPasscode || "").trim().toLowerCase();
        const expectedStored = (merchant.passcode || "").trim().toLowerCase();
        const expectedFormula = merchant.myshopifyDomain.split(".")[0].toLowerCase() + "123";

        const isValid =
          cleanCurrent === expectedStored ||
          cleanCurrent === expectedFormula ||
          cleanCurrent === MASTER_VENDOR_PASSCODE.toLowerCase();

        if (!isValid) {
          return NextResponse.json({ error: "Current passcode is incorrect." }, { status: 401 });
        }
      }

      // Update in PostgreSQL database
      const updated = await prisma.merchant.update({
        where: { id: merchant.id },
        data: { passcode: newPasscode.trim() },
      });

      console.log(`[Passcode Manager] Updated passcode for merchant "${updated.name}" (${updated.myshopifyDomain})`);

      return NextResponse.json({
        success: true,
        message: `Passcode updated successfully for ${updated.name}.`,
        merchantId: updated.id,
      });
    }

    // --------------------------------------------------------------------------
    // ACTION 2: RESET VENDOR PASSCODE TO DEFAULT
    // --------------------------------------------------------------------------
    if (action === "reset_vendor_passcode") {
      if (!merchantId && !domain) {
        return NextResponse.json({ error: "Merchant identifier is required." }, { status: 400 });
      }

      const merchant = await prisma.merchant.findFirst({
        where: merchantId ? { id: merchantId } : { myshopifyDomain: domain },
      });

      if (!merchant) {
        return NextResponse.json({ error: "Merchant not found." }, { status: 404 });
      }

      const defaultPasscode = `${merchant.myshopifyDomain.split(".")[0].toLowerCase()}123`;

      const updated = await prisma.merchant.update({
        where: { id: merchant.id },
        data: { passcode: defaultPasscode },
      });

      console.log(`[Passcode Manager] Reset passcode for merchant "${updated.name}" to default "${defaultPasscode}"`);

      return NextResponse.json({
        success: true,
        message: `Passcode reset to default (${defaultPasscode}) for ${updated.name}.`,
        defaultPasscode,
        merchantId: updated.id,
      });
    }

    // --------------------------------------------------------------------------
    // ACTION 3: VERIFY ADMIN DEFAULT
    // --------------------------------------------------------------------------
    if (action === "get_admin_default") {
      return NextResponse.json({
        success: true,
        defaultConfigured: !!process.env.ADMIN_PASSCODE,
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process passcode request.";
    console.error("Passcode API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
