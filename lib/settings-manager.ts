/**
 * @file settings-manager.ts
 * @description Centralized State & Configuration Manager for Marketplace Global Settings.
 * 
 * Provides client-side persistence (via localStorage) with cross-component reactivity
 * using custom DOM events ('site-settings-changed'). Handles dynamic parameters such as
 * the dropshipping cohort year, site title branding, announcement ticker text, hero carousel slides,
 * and dynamic admin passcode overrides.
 */

/**
 * Interface representing an individual slide item in the Hero section carousel.
 */
export interface CarouselSlide {
  /** Unique identifier for the carousel slide */
  id: string;
  /** Media type of the slide (vector illustration, photograph, video, or promotional banner) */
  type: "svg" | "image" | "video" | "image_ad" | "video_ad";
  /** Prominent badge text displayed in the upper corner of the slide */
  badge: string;
  /** Optional headline title for promotional slides */
  title?: string;
  /** Optional descriptive subtitle explaining the slide or promotion */
  subtitle?: string;
  /** Public asset path or external URL for the image or video */
  mediaSrc?: string;
  /** Call-to-action button label */
  ctaText?: string;
  /** Destination anchor link or external URL for the CTA button */
  ctaLink?: string;
  /** Source attribution: system baseline or vendor submitted */
  source?: "ADMIN_ASSET" | "VENDOR_AD";
  /** Optional associated vendor store name */
  merchantName?: string;
  /** Optional reference to the vendor ad submission UUID */
  adSubmissionId?: string;
}

/**
 * Complete schema for the global marketplace site configuration.
 */
export interface SiteSettings {
  /** Active dropshipping cohort/curriculum year (e.g. "2026", "2027") */
  dropshippingYear: string;
  /** Primary brand and organization name (e.g. "MASTERS UNION") */
  siteTitle: string;
  /** Announcement ticker banner text rendered across the header and hero */
  announcementText: string;
  /** Verified badge text for catalog authenticity */
  catalogBadgeText: string;
  /** Array of active hero promotional slides */
  carouselSlides: CarouselSlide[];
  /** Optional dynamic custom Admin passcode override */
  adminCustomPasscode?: string;
}

/**
 * Permanent Catalog of Admin System Banners & Brand Assets.
 * Features the Masters' Union Animated SVG Squiggle banner at the top.
 */
export const ADMIN_SYSTEM_BANNERS: CarouselSlide[] = [
  {
    id: "admin-asset-svg-squiggle",
    type: "svg",
    badge: "MASTERS UNION PMC",
    subtitle: "dropshipping 2026",
    source: "ADMIN_ASSET",
  },
  {
    id: "admin-asset-featured-merch",
    type: "image",
    badge: "FEATURED MERCHANDISE",
    title: "EXCLUSIVE COLLECTIBLES & ANIME MERCH",
    subtitle: "High-margin trending merchandise & collectibles curated for Masters Union student store owners",
    mediaSrc: "/assets/wp1959356-mob-psycho-100-wallpapers.jpg",
    ctaText: "Explore Featured Merch",
    ctaLink: "#product-catalog",
    source: "ADMIN_ASSET",
  },
  {
    id: "admin-asset-video-anthem",
    type: "video_ad",
    badge: "VENTURE NETWORK",
    title: "MASTERS UNION STUDENT VENTURES",
    subtitle: "Real-time Shopify dropshipping ecosystem curated across premier student-led digital brands.",
    mediaSrc: "/assets/masters_union_dropshipping_v1.mp4",
    ctaText: "Watch & Shop",
    ctaLink: "#product-catalog",
    source: "ADMIN_ASSET",
  },
];

/**
 * Fallback carousel slides displayed on initial load or reset.
 */
export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  ADMIN_SYSTEM_BANNERS[0],
  ADMIN_SYSTEM_BANNERS[1],
];

/** Baseline default admin passcode from environment variable */
export const DEFAULT_ENV_ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "admin123";

/**
 * Default global site settings used as baseline fallbacks.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  dropshippingYear: "2026",
  siteTitle: "MASTERS UNION",
  announcementText: "MASTERS UNION PMC — STUDENT-CURATED DROPSHIPPING NETWORK",
  catalogBadgeText: "OFFICIAL CATALOG",
  carouselSlides: DEFAULT_CAROUSEL_SLIDES,
  adminCustomPasscode: undefined,
};

/** Key used to store and retrieve site settings in browser localStorage */
const SETTINGS_KEY = "dropshipping_marketplace_site_settings";

/**
 * Retrieves the current site settings from browser localStorage with safe SSR fallbacks.
 * 
 * @returns {SiteSettings} The active site settings or the default configuration.
 */
export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        carouselSlides:
          parsed.carouselSlides && Array.isArray(parsed.carouselSlides) && parsed.carouselSlides.length > 0
            ? parsed.carouselSlides
            : DEFAULT_CAROUSEL_SLIDES,
      };
    }
  } catch (e) {
    console.error("Error reading site settings from localStorage", e);
  }
  return DEFAULT_SITE_SETTINGS;
}

/**
 * Returns the currently active Admin passcode (custom override or .env default).
 */
export function getActiveAdminPasscode(): string {
  const settings = getSiteSettings();
  return settings.adminCustomPasscode?.trim() || DEFAULT_ENV_ADMIN_PASSCODE;
}

/**
 * Updates the custom Admin passcode in site settings.
 */
export function setAdminCustomPasscode(newPasscode: string): void {
  const settings = getSiteSettings();
  saveSiteSettings({
    ...settings,
    adminCustomPasscode: newPasscode.trim(),
  });
}

/**
 * Resets the Admin passcode back to the environment variable default.
 */
export function resetAdminPasscodeToDefault(): void {
  const settings = getSiteSettings();
  saveSiteSettings({
    ...settings,
    adminCustomPasscode: undefined,
  });
}

/**
 * Persists updated site settings to localStorage and dispatches a global
 * 'site-settings-changed' DOM event to trigger instant re-renders in listening components.
 * 
 * @param {SiteSettings} settings - The updated site settings to save.
 */
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

/**
 * Resets site settings back to system defaults, clears localStorage, and broadcasts the change.
 * 
 * @returns {SiteSettings} The default site settings.
 */
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

/**
 * Retrieves the catalog of permanent Admin System Banners.
 */
export function getAdminSystemBanners(): CarouselSlide[] {
  return ADMIN_SYSTEM_BANNERS;
}

/**
 * Injects an approved vendor ad submission into the live hero carousel.
 */
export function addVendorAdToCarousel(ad: {
  id: string;
  type: "IMAGE_AD" | "VIDEO_AD" | "SHOWCASE" | "image_ad" | "video_ad" | "image" | "video";
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  mediaSrc: string;
  ctaText?: string | null;
  ctaLink?: string | null;
  merchantName?: string;
}): SiteSettings {
  const settings = getSiteSettings();
  const currentSlides = settings.carouselSlides || [];

  // Map submission type to CarouselSlide type
  let slideType: CarouselSlide["type"] = "image_ad";
  const upper = String(ad.type).toUpperCase();
  if (upper === "VIDEO_AD" || upper === "VIDEO") {
    slideType = "video_ad";
  } else if (upper === "SHOWCASE" || upper === "IMAGE") {
    slideType = "image";
  } else {
    slideType = "image_ad";
  }

  const existingIndex = currentSlides.findIndex(
    (s) => s.adSubmissionId === ad.id || s.id === `ad-${ad.id}`
  );

  const newSlide: CarouselSlide = {
    id: `ad-${ad.id}`,
    adSubmissionId: ad.id,
    source: "VENDOR_AD",
    type: slideType,
    badge: ad.badge || "VENDOR SPOTLIGHT",
    title: ad.title,
    subtitle: ad.subtitle || undefined,
    mediaSrc: ad.mediaSrc,
    ctaText: ad.ctaText || "Explore Drop",
    ctaLink: ad.ctaLink || "#product-catalog",
    merchantName: ad.merchantName,
  };

  let updatedSlides: CarouselSlide[];
  if (existingIndex >= 0) {
    updatedSlides = [...currentSlides];
    updatedSlides[existingIndex] = newSlide;
  } else {
    updatedSlides = [...currentSlides, newSlide];
  }

  const updatedSettings: SiteSettings = {
    ...settings,
    carouselSlides: updatedSlides,
  };

  saveSiteSettings(updatedSettings);
  return updatedSettings;
}

/**
 * Removes a vendor ad slide from the live carousel.
 */
export function removeVendorAdFromCarousel(adSubmissionId: string): SiteSettings {
  const settings = getSiteSettings();
  const currentSlides = settings.carouselSlides || [];
  const updatedSlides = currentSlides.filter(
    (s) => s.adSubmissionId !== adSubmissionId && s.id !== `ad-${adSubmissionId}`
  );

  const updatedSettings: SiteSettings = {
    ...settings,
    carouselSlides: updatedSlides.length > 0 ? updatedSlides : DEFAULT_CAROUSEL_SLIDES,
  };

  saveSiteSettings(updatedSettings);
  return updatedSettings;
}

/**
 * Toggles an Admin System Banner (such as the Masters' Union Animated SVG Squiggle)
 * into or out of the live Hero Carousel.
 */
export function toggleAdminBannerInCarousel(adminBannerId: string): boolean {
  const settings = getSiteSettings();
  const currentSlides = settings.carouselSlides || [];
  const exists = currentSlides.some((s) => s.id === adminBannerId);

  if (exists) {
    if (currentSlides.length <= 1) {
      return false; // Prevent removing the last remaining slide
    }
    const updated = currentSlides.filter((s) => s.id !== adminBannerId);
    saveSiteSettings({ ...settings, carouselSlides: updated });
    return false; // Inactive now
  } else {
    const template = ADMIN_SYSTEM_BANNERS.find((b) => b.id === adminBannerId);
    if (!template) return false;
    const updated = [template, ...currentSlides];
    saveSiteSettings({ ...settings, carouselSlides: updated });
    return true; // Active now
  }
}

