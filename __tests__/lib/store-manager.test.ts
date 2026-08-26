import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getInitialMerchants,
  getInitialSlots,
  approveMerchantStore,
  rejectMerchantStore,
  deleteMerchantStore,
  updateSlotPrice,
  restockSlotInventory,
  updateSlotTags,
  updateMerchantPasscode,
  resetMerchantPasscode,
} from "@/lib/store-manager";
import { MerchantVendor, SlotListing } from "@/data/mock-slots";

const MOCK_TEST_MERCHANT: MerchantVendor = {
  id: "m-test-1",
  name: "Test Store",
  myshopifyDomain: "teststore.myshopify.com",
  storeLogo: "",
  status: "PENDING",
  totalProducts: 1,
  connectedSince: "2026-01-01",
  lastWebhookSync: "Never",
  passcode: "teststore123",
};

const MOCK_TEST_SLOT: SlotListing = {
  id: "slot-test-1",
  slotNumber: "SLOT #999",
  title: "Test Tactical Backpack",
  description: "Durable military-grade backpack",
  category: "Tactical Tech & EDC",
  price: 2999,
  inventoryQuantity: 5,
  status: "AVAILABLE",
  shopifyProductId: "gid://shopify/Product/1",
  shopifyVariantId: "gid://shopify/ProductVariant/1",
  merchant: MOCK_TEST_MERCHANT,
  tags: ["tactical", "backpack"],
  images: ["https://example.com/image.jpg"],
  sku: "TEST-SKU-1",
  createdAt: "2026-01-01",
  variants: [
    {
      id: "v-1",
      title: "Black",
      price: 2999,
      sku: "TEST-SKU-1-BLK",
      inventoryQuantity: 5,
      availableForSale: true,
    },
  ],
  syncLogs: [],
};

describe("lib/store-manager - Store & Catalog Operations", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("getInitialMerchants() and getInitialSlots()", () => {
    it("returns array lists when localStorage is empty", () => {
      const merchants = getInitialMerchants();
      const slots = getInitialSlots();
      expect(Array.isArray(merchants)).toBe(true);
      expect(Array.isArray(slots)).toBe(true);
    });

    it("retrieves and parses stored items from localStorage", () => {
      localStorage.setItem(
        "dropshipping_marketplace_merchants",
        JSON.stringify([MOCK_TEST_MERCHANT])
      );
      localStorage.setItem(
        "dropshipping_marketplace_slots",
        JSON.stringify([MOCK_TEST_SLOT])
      );

      const merchants = getInitialMerchants();
      const slots = getInitialSlots();
      expect(merchants.length).toBe(1);
      expect(merchants[0].id).toBe("m-test-1");
      expect(slots.length).toBe(1);
      expect(slots[0].id).toBe("slot-test-1");
    });
  });

  describe("approveMerchantStore()", () => {
    it("transitions merchant and associated slot to ACTIVE status with audit log", () => {
      const { updatedMerchants, updatedSlots } = approveMerchantStore(
        "m-test-1",
        [MOCK_TEST_MERCHANT],
        [MOCK_TEST_SLOT]
      );

      const approvedMerchant = updatedMerchants.find((m) => m.id === "m-test-1");
      expect(approvedMerchant?.status).toBe("ACTIVE");

      const approvedSlot = updatedSlots.find((s) => s.id === "slot-test-1");
      expect(approvedSlot?.merchant.status).toBe("ACTIVE");
      expect(approvedSlot?.syncLogs.length).toBe(1);
      expect(approvedSlot?.syncLogs[0].status).toBe("SUCCESS");
    });
  });

  describe("rejectMerchantStore()", () => {
    it("transitions merchant and associated slot to REJECTED status", () => {
      const { updatedMerchants, updatedSlots } = rejectMerchantStore(
        "m-test-1",
        [MOCK_TEST_MERCHANT],
        [MOCK_TEST_SLOT]
      );

      const rejectedMerchant = updatedMerchants.find((m) => m.id === "m-test-1");
      expect(rejectedMerchant?.status).toBe("REJECTED");

      const rejectedSlot = updatedSlots.find((s) => s.id === "slot-test-1");
      expect(rejectedSlot?.merchant.status).toBe("REJECTED");
    });
  });

  describe("deleteMerchantStore()", () => {
    it("cascades deletion across merchants and corresponding slots", () => {
      const { updatedMerchants, updatedSlots } = deleteMerchantStore(
        "m-test-1",
        [MOCK_TEST_MERCHANT],
        [MOCK_TEST_SLOT]
      );

      expect(updatedMerchants.find((m) => m.id === "m-test-1")).toBeUndefined();
      expect(updatedSlots.find((s) => s.merchant.id === "m-test-1")).toBeUndefined();
    });
  });

  describe("updateSlotPrice()", () => {
    it("updates product price, variant prices, and creates audit log", () => {
      const updated = updateSlotPrice("slot-test-1", 3499, [MOCK_TEST_SLOT]);
      const targetSlot = updated.find((s) => s.id === "slot-test-1");

      expect(targetSlot?.price).toBe(3499);
      expect(targetSlot?.variants[0].price).toBe(3499);
      expect(targetSlot?.syncLogs[0].details).toContain("3499");
    });
  });

  describe("restockSlotInventory()", () => {
    it("increments slot and variant inventory quantities", () => {
      const updated = restockSlotInventory("slot-test-1", 10, [MOCK_TEST_SLOT]);
      const targetSlot = updated.find((s) => s.id === "slot-test-1");

      expect(targetSlot?.inventoryQuantity).toBe(15);
      expect(targetSlot?.variants[0].inventoryQuantity).toBe(15);
      expect(targetSlot?.status).toBe("AVAILABLE");
      expect(targetSlot?.syncLogs[0].details).toContain("Added +10 units");
    });
  });

  describe("updateSlotTags()", () => {
    it("merges unique discoverability tags without duplication", () => {
      const updated = updateSlotTags(
        "slot-test-1",
        ["waterproof", "tactical", "outdoor"],
        [MOCK_TEST_SLOT]
      );
      const targetSlot = updated.find((s) => s.id === "slot-test-1");

      expect(targetSlot?.tags).toContain("waterproof");
      expect(targetSlot?.tags).toContain("outdoor");
      expect(targetSlot?.tags.filter((t) => t === "tactical").length).toBe(1);
    });
  });

  describe("Merchant Passcode Management", () => {
    it("updates merchant custom passcode", () => {
      const updated = updateMerchantPasscode("m-test-1", "newSecret99", [
        MOCK_TEST_MERCHANT,
      ]);
      const merchant = updated.find((m) => m.id === "m-test-1");
      expect(merchant?.passcode).toBe("newSecret99");
    });

    it("resets merchant passcode to formula default", () => {
      const { updatedMerchants, defaultPasscode } = resetMerchantPasscode(
        "m-test-1",
        [{ ...MOCK_TEST_MERCHANT, passcode: "customPass" }]
      );
      expect(defaultPasscode).toBe("teststore123");
      const merchant = updatedMerchants.find((m) => m.id === "m-test-1");
      expect(merchant?.passcode).toBe("teststore123");
    });
  });
});
