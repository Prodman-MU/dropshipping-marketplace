import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import {
  verifyShopifyHmac,
  getShopifySlots,
  getSlotById,
  getMerchants,
} from "@/lib/shopify";
import { MOCK_SLOTS, MOCK_MERCHANTS } from "@/data/mock-slots";

describe("lib/shopify - Shopify API & Webhook Ingestion", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("verifyShopifyHmac()", () => {
    it("returns true in dev fallback mode when secret is missing", () => {
      delete process.env.SHOPIFY_WEBHOOK_SECRET;
      expect(verifyShopifyHmac("test body", null)).toBe(true);
    });

    it("verifies a valid HMAC signature correctly", () => {
      const secret = "test_webhook_secret_key_123";
      const body = JSON.stringify({ id: 12345, event: "orders/create" });
      const validHmac = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64");

      expect(verifyShopifyHmac(body, validHmac, secret)).toBe(true);
    });

    it("rejects an invalid HMAC signature", () => {
      const secret = "test_webhook_secret_key_123";
      const body = JSON.stringify({ id: 12345 });
      const invalidHmac = "invalid_signature_hash";

      expect(verifyShopifyHmac(body, invalidHmac, secret)).toBe(false);
    });
  });

  describe("getShopifySlots() fallback handling", () => {
    it("returns mock slots array when live credentials are not configured", async () => {
      delete process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
      delete process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

      const slots = await getShopifySlots();
      expect(Array.isArray(slots)).toBe(true);
      expect(slots).toEqual(MOCK_SLOTS);
    });
  });

  describe("getSlotById()", () => {
    it("returns undefined for non-existent slot", async () => {
      const found = await getSlotById("non-existent-slot-9999");
      expect(found).toBeUndefined();
    });
  });

  describe("getMerchants()", () => {
    it("returns active merchant vendors list", async () => {
      const merchants = await getMerchants();
      expect(Array.isArray(merchants)).toBe(true);
      expect(merchants).toEqual(MOCK_MERCHANTS);
    });
  });
});
