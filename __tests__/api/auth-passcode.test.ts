import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/passcode/route";
import { NextRequest } from "next/server";

// Mock the prisma singleton
vi.mock("@/lib/prisma", () => ({
  prisma: {
    merchant: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    siteSetting: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

function createMockRequest(body: Record<string, any>): NextRequest {
  return new NextRequest("http://localhost:3000/api/auth/passcode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/passcode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for an invalid action", async () => {
    const req = createMockRequest({ action: "invalid_action" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid action specified.");
  });

  describe("action: update_vendor_passcode", () => {
    it("returns 400 if merchant identifier is missing", async () => {
      const req = createMockRequest({
        action: "update_vendor_passcode",
        newPasscode: "newPass123",
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Merchant identifier is required.");
    });

    it("returns 400 if new passcode is less than 4 characters", async () => {
      const req = createMockRequest({
        action: "update_vendor_passcode",
        merchantId: "m-1",
        newPasscode: "123",
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("New passcode must be at least 4 characters long.");
    });

    it("returns 404 if merchant is not found", async () => {
      (prisma.merchant.findFirst as any).mockResolvedValue(null);

      const req = createMockRequest({
        action: "update_vendor_passcode",
        merchantId: "nonexistent",
        newPasscode: "validPass123",
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe("Merchant not found.");
    });

    it("successfully updates passcode with admin override", async () => {
      (prisma.merchant.findFirst as any).mockResolvedValue({
        id: "m-1",
        name: "Test Store",
        myshopifyDomain: "test.myshopify.com",
        passcode: "oldPass",
      });
      (prisma.merchant.update as any).mockResolvedValue({
        id: "m-1",
        name: "Test Store",
        myshopifyDomain: "test.myshopify.com",
        passcode: "newPass123",
      });

      const req = createMockRequest({
        action: "update_vendor_passcode",
        merchantId: "m-1",
        newPasscode: "newPass123",
        isAdminOverride: true,
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.merchant.update).toHaveBeenCalledWith({
        where: { id: "m-1" },
        data: { passcode: "newPass123" },
      });
    });
  });

  describe("action: reset_vendor_passcode", () => {
    it("resets merchant passcode to formula default (<domain>123)", async () => {
      (prisma.merchant.findFirst as any).mockResolvedValue({
        id: "m-1",
        name: "Pause2Play",
        myshopifyDomain: "pause2play.myshopify.com",
      });
      (prisma.merchant.update as any).mockResolvedValue({
        id: "m-1",
        name: "Pause2Play",
        myshopifyDomain: "pause2play.myshopify.com",
        passcode: "pause2play123",
      });

      const req = createMockRequest({
        action: "reset_vendor_passcode",
        merchantId: "m-1",
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.defaultPasscode).toBe("pause2play123");
    });
  });

  describe("action: get_admin_default", () => {
    it("returns admin configuration status", async () => {
      (prisma.siteSetting.findUnique as any).mockResolvedValue({
        id: "default",
        adminPasscode: "customAdminPass",
      });

      const req = createMockRequest({
        action: "get_admin_default",
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.activeDbPasscode).toBe("customAdminPass");
    });
  });
});
