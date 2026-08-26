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
});
