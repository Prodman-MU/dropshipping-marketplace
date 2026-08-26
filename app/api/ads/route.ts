/**
 * @file route.ts (under app/api/ads/)
 * @description Vendor Hero Ad Submissions & Admin Moderation REST API.
 * 
 * Supports:
 * - GET: Fetch ads by merchantId or all ads for admin review
 * - POST: Vendor creates a new hero banner ad request
 * - PATCH: Admin updates status (APPROVED, REJECTED) and feedback
 * - DELETE: Delete an ad submission
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (merchantId) whereClause.merchantId = merchantId;
    if (status) whereClause.status = status;

    const ads = await prisma.adSubmission.findMany({
      where: whereClause,
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            myshopifyDomain: true,
            storeLogo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, ads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch ad submissions";
    console.error("[Ads API Error - GET]:", error);
    return NextResponse.json({ success: false, error: message, ads: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      merchantId,
      domain,
      type = "IMAGE_AD",
      badge = "VENDOR SPOTLIGHT",
      title,
      subtitle,
      mediaSrc,
      ctaText = "Explore Drop",
      ctaLink = "#product-catalog",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Headline title is required." }, { status: 400 });
    }

    if (!mediaSrc || !mediaSrc.trim()) {
      return NextResponse.json({ success: false, error: "Media image or video is required." }, { status: 400 });
    }

    // Resolve merchant
    let resolvedMerchantId = merchantId;
    if (!resolvedMerchantId && domain) {
      const merchant = await prisma.merchant.findFirst({
        where: { myshopifyDomain: domain },
      });
      if (merchant) {
        resolvedMerchantId = merchant.id;
      }
    }

    if (!resolvedMerchantId) {
      // Find or fallback to first active merchant if merchantId is not provided
      const firstMerchant = await prisma.merchant.findFirst();
      if (firstMerchant) {
        resolvedMerchantId = firstMerchant.id;
      } else {
        return NextResponse.json({ success: false, error: "Valid merchant identifier is required." }, { status: 400 });
      }
    }

    // Validate type enum
    const validTypes = ["IMAGE_AD", "VIDEO_AD", "SHOWCASE"];
    const normalizedType = validTypes.includes(type) ? type : "IMAGE_AD";

    const ad = await prisma.adSubmission.create({
      data: {
        merchantId: resolvedMerchantId,
        type: normalizedType as any,
        badge: badge.trim() || "VENDOR SPOTLIGHT",
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : null,
        mediaSrc: mediaSrc.trim(),
        ctaText: ctaText ? ctaText.trim() : "Explore Drop",
        ctaLink: ctaLink ? ctaLink.trim() : "#product-catalog",
        status: "PENDING",
      },
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            myshopifyDomain: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, ad }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create ad submission";
    console.error("[Ads API Error - POST]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, status, adminFeedback } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Ad submission ID is required." }, { status: 400 });
    }

    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value." }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminFeedback !== undefined) updateData.adminFeedback = adminFeedback;

    const updatedAd = await prisma.adSubmission.update({
      where: { id },
      data: updateData,
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            myshopifyDomain: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, ad: updatedAd });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update ad submission";
    console.error("[Ads API Error - PATCH]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Ad submission ID is required." }, { status: 400 });
    }

    await prisma.adSubmission.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Ad submission deleted successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete ad submission";
    console.error("[Ads API Error - DELETE]:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
