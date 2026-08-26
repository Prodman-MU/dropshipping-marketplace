import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, PATCH, DELETE } from "@/app/api/ads/route";
import { NextRequest } from "next/server";

// Mock the prisma singleton
vi.mock("@/lib/prisma", () => ({
  prisma: {
    merchant: {
      findFirst: vi.fn(),
    },
    adSubmission: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("API Route: /api/ads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/ads", () => {
    it("returns list of ads filtered by merchantId", async () => {
      const mockAds = [
        {
          id: "ad-1",
          merchantId: "m-1",
          type: "IMAGE_AD",
          title: "Anime Merch Drop",
          status: "APPROVED",
          merchant: { id: "m-1", name: "Apex", myshopifyDomain: "apex.myshopify.com" },
        },
      ];

      (prisma.adSubmission.findMany as any).mockResolvedValue(mockAds);

      const req = new NextRequest("http://localhost:3000/api/ads?merchantId=m-1");
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.ads).toHaveLength(1);
      expect(data.ads[0].id).toBe("ad-1");
    });
  });

  describe("POST /api/ads", () => {
    it("returns 400 when required fields are missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Incomplete Ad",
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it("creates a new ad submission successfully", async () => {
      (prisma.merchant.findFirst as any).mockResolvedValue({
        id: "m-1",
        name: "Apex Store",
        myshopifyDomain: "apex.myshopify.com",
      });

      const createdAd = {
        id: "ad-new",
        merchantId: "m-1",
        type: "IMAGE_AD",
        badge: "VENDOR DROP",
        title: "Streetwear 2026",
        subtitle: "Fresh hoodies",
        mediaSrc: "https://example.com/ad.jpg",
        ctaText: "Shop",
        ctaLink: "/products/hoodie",
        status: "PENDING",
      };

      (prisma.adSubmission.create as any).mockResolvedValue(createdAd);

      const req = new NextRequest("http://localhost:3000/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: "m-1",
          type: "IMAGE_AD",
          badge: "VENDOR DROP",
          title: "Streetwear 2026",
          subtitle: "Fresh hoodies",
          mediaSrc: "https://example.com/ad.jpg",
          ctaText: "Shop",
          ctaLink: "/products/hoodie",
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.ad.id).toBe("ad-new");
    });
  });

  describe("PATCH /api/ads", () => {
    it("updates ad status and feedback", async () => {
      const updatedAd = {
        id: "ad-1",
        status: "APPROVED",
        adminFeedback: null,
      };

      (prisma.adSubmission.update as any).mockResolvedValue(updatedAd);

      const req = new NextRequest("http://localhost:3000/api/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "ad-1",
          status: "APPROVED",
        }),
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.ad.status).toBe("APPROVED");
    });

    it("returns 400 when ad id is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
        }),
      });

      const res = await PATCH(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Ad submission ID is required.");
    });
  });

  describe("DELETE /api/ads", () => {
    it("deletes ad submission by id", async () => {
      (prisma.adSubmission.delete as any).mockResolvedValue({ id: "ad-1" });

      const req = new NextRequest("http://localhost:3000/api/ads?id=ad-1", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
