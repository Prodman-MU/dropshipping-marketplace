import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  getActiveAdminPasscode,
  setAdminCustomPasscode,
  resetAdminPasscodeToDefault,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_ENV_ADMIN_PASSCODE,
  getAdminSystemBanners,
  addVendorAdToCarousel,
  removeVendorAdFromCarousel,
  toggleAdminBannerInCarousel,
} from "@/lib/settings-manager";

describe("lib/settings-manager - Global Site Configuration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("getSiteSettings()", () => {
    it("returns default site settings when localStorage is empty", () => {
      const settings = getSiteSettings();
      expect(settings).toEqual(DEFAULT_SITE_SETTINGS);
      expect(settings.dropshippingYear).toBe("2026");
      expect(settings.siteTitle).toBe("MASTERS UNION");
    });

    it("retrieves saved settings from localStorage", () => {
      const customSettings = {
        ...DEFAULT_SITE_SETTINGS,
        siteTitle: "CUSTOM DROPSHIP MARKETPLACE",
        dropshippingYear: "2027",
      };
      localStorage.setItem(
        "dropshipping_marketplace_site_settings",
        JSON.stringify(customSettings)
      );

      const retrieved = getSiteSettings();
      expect(retrieved.siteTitle).toBe("CUSTOM DROPSHIP MARKETPLACE");
      expect(retrieved.dropshippingYear).toBe("2027");
    });
  });

  describe("saveSiteSettings()", () => {
    it("persists settings to localStorage and dispatches site-settings-changed event", () => {
      const listener = vi.fn();
      window.addEventListener("site-settings-changed", listener);

      const updated = {
        ...DEFAULT_SITE_SETTINGS,
        announcementText: "NEW SPRING COHORT 2026 LAUNCHED",
      };

      saveSiteSettings(updated);

      expect(listener).toHaveBeenCalledTimes(1);
      const stored = JSON.parse(
        localStorage.getItem("dropshipping_marketplace_site_settings") || "{}"
      );
      expect(stored.announcementText).toBe("NEW SPRING COHORT 2026 LAUNCHED");

      window.removeEventListener("site-settings-changed", listener);
    });
  });

  describe("resetSiteSettings()", () => {
    it("clears localStorage and returns DEFAULT_SITE_SETTINGS", () => {
      saveSiteSettings({
        ...DEFAULT_SITE_SETTINGS,
        siteTitle: "Temp Title",
      });

      const reset = resetSiteSettings();
      expect(reset).toEqual(DEFAULT_SITE_SETTINGS);
      expect(
        localStorage.getItem("dropshipping_marketplace_site_settings")
      ).toBeNull();
    });
  });

  describe("Admin Passcode Management", () => {
    it("returns default passcode when no override is set", () => {
      expect(getActiveAdminPasscode()).toBe(DEFAULT_ENV_ADMIN_PASSCODE);
    });

    it("allows updating custom admin passcode and retrieves it", () => {
      setAdminCustomPasscode("superSecret2026");
      expect(getActiveAdminPasscode()).toBe("superSecret2026");
    });

    it("resets admin passcode back to default", () => {
      setAdminCustomPasscode("tempPass123");
      expect(getActiveAdminPasscode()).toBe("tempPass123");

      resetAdminPasscodeToDefault();
      expect(getActiveAdminPasscode()).toBe(DEFAULT_ENV_ADMIN_PASSCODE);
    });
  });

  describe("Hero Carousel Banner & Ad Submissions Management", () => {
    it("getAdminSystemBanners returns predefined official assets with SVG squiggle as baseline", () => {
      const banners = getAdminSystemBanners();
      expect(banners.length).toBeGreaterThanOrEqual(3);
      expect(banners[0].id).toBe("admin-asset-svg-squiggle");
      expect(banners[0].type).toBe("svg");
      expect(banners[0].source).toBe("ADMIN_ASSET");
    });

    it("addVendorAdToCarousel adds vendor ad to live carousel slides", () => {
      const ad = {
        id: "ad-test-123",
        type: "IMAGE_AD" as const,
        badge: "VENDOR DROP",
        title: "Test Streetwear Drop",
        subtitle: "Exclusive hoodies",
        mediaSrc: "https://example.com/ad.jpg",
        ctaText: "Shop Drop",
        ctaLink: "/products/hoodie",
        merchantName: "Apex Gear",
      };

      const updated = addVendorAdToCarousel(ad);
      const slide = updated.carouselSlides.find((s) => s.adSubmissionId === "ad-test-123");
      expect(slide).toBeDefined();
      expect(slide?.type).toBe("image_ad");
      expect(slide?.source).toBe("VENDOR_AD");
      expect(slide?.merchantName).toBe("Apex Gear");
      expect(slide?.title).toBe("Test Streetwear Drop");
    });

    it("removeVendorAdFromCarousel removes vendor ad from live carousel slides", () => {
      addVendorAdToCarousel({
        id: "ad-to-remove",
        type: "VIDEO_AD" as const,
        title: "Video Ad",
        mediaSrc: "https://example.com/video.mp4",
      });

      const afterRemove = removeVendorAdFromCarousel("ad-to-remove");
      const found = afterRemove.carouselSlides.find((s) => s.adSubmissionId === "ad-to-remove");
      expect(found).toBeUndefined();
    });

    it("toggleAdminBannerInCarousel toggles banner active and inactive", () => {
      // Toggle off default SVG squiggle
      const isNowActive1 = toggleAdminBannerInCarousel("admin-asset-svg-squiggle");
      expect(isNowActive1).toBe(false);
      let current = getSiteSettings();
      expect(current.carouselSlides.some((s) => s.id === "admin-asset-svg-squiggle")).toBe(false);

      // Toggle back on
      const isNowActive2 = toggleAdminBannerInCarousel("admin-asset-svg-squiggle");
      expect(isNowActive2).toBe(true);
      current = getSiteSettings();
      expect(current.carouselSlides.some((s) => s.id === "admin-asset-svg-squiggle")).toBe(true);
    });
  });
});

