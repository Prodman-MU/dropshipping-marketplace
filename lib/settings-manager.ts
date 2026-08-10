export interface SiteSettings {
  dropshippingYear: string;
  siteTitle: string;
  announcementText: string;
  catalogBadgeText: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  dropshippingYear: "2026",
  siteTitle: "MASTERS UNION",
  announcementText: "MASTERS UNION PMC — STUDENT-CURATED DROPSHIPPING NETWORK",
  catalogBadgeText: "OFFICIAL CATALOG",
};

const SETTINGS_KEY = "dropshipping_marketplace_site_settings";

export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error("Error reading site settings from localStorage", e);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: SiteSettings): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event("site-settings-changed"));
    } catch (e) {
      console.error("Error saving site settings to localStorage", e);
    }
  }
}

export function resetSiteSettings(): SiteSettings {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      window.dispatchEvent(new Event("site-settings-changed"));
    } catch (e) {
      console.error("Error resetting site settings in localStorage", e);
    }
  }
  return DEFAULT_SITE_SETTINGS;
}
