import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatNumber,
  cleanStoreDomain,
  getDomainCandidates,
  isSameStoreDomain,
  normalizeStoreUrl,
  getStoreSlug,
  getProductHandle,
  getProductPageUrl,
} from "@/lib/utils";

describe("lib/utils - General-Purpose Utilities", () => {
  describe("cn() - Tailwind CSS class merging", () => {
    it("merges class names correctly", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("handles conditional classes and falsy values", () => {
      expect(cn("px-4", false && "hidden", null, undefined, "text-white")).toBe(
        "px-4 text-white"
      );
    });

    it("resolves Tailwind conflicts using tailwind-merge", () => {
      expect(cn("p-4", "p-8")).toBe("p-8");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });
  });

  describe("formatCurrency()", () => {
    it("formats INR currency correctly by default", () => {
      const formatted = formatCurrency(4999);
      expect(formatted).toContain("4,999");
      expect(formatted).toMatch(/₹|INR/);
    });

    it("formats USD currency correctly", () => {
      const formatted = formatCurrency(149.99, "USD");
      expect(formatted).toContain("149.99");
      expect(formatted).toMatch(/\$|USD/);
    });

    it("handles zero and decimal values", () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain("0.00");
    });
  });

  describe("formatNumber()", () => {
    it("formats numbers with comma separators", () => {
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(42)).toBe("42");
      expect(formatNumber(1234)).toBe("1,234");
    });
  });

  describe("cleanStoreDomain()", () => {
    it("extracts hostname from full URLs with protocols and paths", () => {
      expect(
        cleanStoreDomain("https://apex-gear.myshopify.com/products/test?ref=123")
      ).toBe("apex-gear.myshopify.com");
      expect(cleanStoreDomain("http://pause2play.in/collections/all")).toBe(
        "pause2play.in"
      );
    });

    it("strips trailing slashes, whitespace and quotes", () => {
      expect(cleanStoreDomain("pause2play.in/")).toBe("pause2play.in");
      expect(cleanStoreDomain("  'mystore.myshopify.com'  ")).toBe(
        "mystore.myshopify.com"
      );
    });

    it("strips port numbers", () => {
      expect(cleanStoreDomain("localhost:3000")).toBe("localhost");
      expect(cleanStoreDomain("http://store.local:8080/test")).toBe("store.local");
    });

    it("returns empty string for empty/null inputs", () => {
      expect(cleanStoreDomain("")).toBe("");
      expect(cleanStoreDomain("   ")).toBe("");
    });
  });

  describe("getDomainCandidates()", () => {
    it("generates candidates for a custom domain", () => {
      const candidates = getDomainCandidates("pause2play.in");
      expect(candidates).toContain("pause2play.in");
      expect(candidates).toContain("www.pause2play.in");
      expect(candidates).toContain("pause2play.myshopify.com");
    });

    it("generates candidates for a bare handle", () => {
      const candidates = getDomainCandidates("apex-gear");
      expect(candidates).toContain("apex-gear.myshopify.com");
    });

    it("generates candidates for a myshopify domain", () => {
      const candidates = getDomainCandidates("apex-gear.myshopify.com");
      expect(candidates).toContain("apex-gear.myshopify.com");
      expect(candidates).not.toContain("www.apex-gear.myshopify.com");
    });

    it("returns empty array for invalid input", () => {
      expect(getDomainCandidates("")).toEqual([]);
    });
  });

  describe("isSameStoreDomain()", () => {
    it("identifies matching domain variations", () => {
      expect(isSameStoreDomain("pause2play.in", "www.pause2play.in")).toBe(true);
      expect(isSameStoreDomain("https://pause2play.in/", "pause2play.myshopify.com")).toBe(true);
      expect(isSameStoreDomain("apex-gear", "apex-gear.myshopify.com")).toBe(true);
    });

    it("returns false for different domains", () => {
      expect(isSameStoreDomain("pause2play.in", "apex-gear.myshopify.com")).toBe(false);
      expect(isSameStoreDomain("", "pause2play.in")).toBe(false);
    });
  });

  describe("normalizeStoreUrl()", () => {
    it("returns fully qualified HTTPS URLs", () => {
      expect(normalizeStoreUrl("pause2play.in")).toBe("https://pause2play.in");
      expect(normalizeStoreUrl("http://store.myshopify.com")).toBe("https://store.myshopify.com");
      expect(normalizeStoreUrl("")).toBe("");
    });
  });

  describe("getStoreSlug()", () => {
    it("extracts clean URL-safe store brand slugs", () => {
      expect(getStoreSlug("www.pause2play.in")).toBe("pause2play");
      expect(getStoreSlug("apex-gear.myshopify.com")).toBe("apex-gear");
      expect(getStoreSlug("masters-union.myshopify.com")).toBe("masters-union");
      expect(getStoreSlug("")).toBe("store");
    });
  });

  describe("getProductHandle()", () => {
    it("derives handle from product handle if present", () => {
      expect(getProductHandle({ handle: "cool-tshirt-2026", title: "Cool T-Shirt", id: "p1" })).toBe(
        "cool-tshirt-2026"
      );
    });

    it("derives handle from product title if handle missing", () => {
      expect(getProductHandle({ title: "Neon Cyberpunk Hoodie", id: "p2" })).toBe(
        "neon-cyberpunk-hoodie"
      );
    });

    it("falls back to product id if neither present", () => {
      expect(getProductHandle({ id: "slot-99" })).toBe("slot-99");
    });
  });

  describe("getProductPageUrl()", () => {
    it("generates canonical store-namespaced product URL", () => {
      const slot = {
        id: "s-101",
        title: "Minecraft Blocks 46 pcs",
        handle: "minecraft-blocks-46-pcs",
        merchant: {
          myshopifyDomain: "pause2play.myshopify.com",
          name: "Pause2Play",
        },
      };
      expect(getProductPageUrl(slot)).toBe("/product/pause2play/minecraft-blocks-46-pcs");
    });
  });
});
