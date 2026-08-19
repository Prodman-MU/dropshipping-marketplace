/**
 * @file settings-manager.ts
 * @description Centralized State & Configuration Manager for Marketplace Global Settings.
 * 
 * Provides client-side persistence (via localStorage) with cross-component reactivity
 * using custom DOM events ('site-settings-changed'). Handles dynamic parameters such as
 * the dropshipping cohort year, site title branding, announcement ticker text, and hero carousel slides.
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
}

/**
 * Fallback carousel slides displayed on initial load or reset.
 */
export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "slide-1",
    type: "svg",
    badge: "MASTERS UNION PMC",
    subtitle: "dropshipping 2026",
  },
  {
    id: "slide-2",
    type: "image",
    badge: "FEATURED MERCHANDISE",
    title: "EXCLUSIVE COLLECTIBLES & ANIME MERCH",
    subtitle: "High-margin trending merchandise & collectibles curated for Masters Union student store owners",
    mediaSrc: "/assets/wp1959356-mob-psycho-100-wallpapers.jpg",
    ctaText: "Explore Featured Merch",
    ctaLink: "#product-catalog",
  },
];

/**
 * Default global site settings used as baseline fallbacks.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  dropshippingYear: "2026",
  siteTitle: "MASTERS UNION",
  announcementText: "MASTERS UNION PMC — STUDENT-CURATED DROPSHIPPING NETWORK",
  catalogBadgeText: "OFFICIAL CATALOG",
  carouselSlides: DEFAULT_CAROUSEL_SLIDES,
};

/** Key used to store and retrieve site settings in browser localStorage */
const SETTINGS_KEY = "dropshipping_marketplace_site_settings";

/**
 * Retrieves the current site settings from browser localStorage with safe SSR fallbacks.
 * 
 * @returns {SiteSettings} The active site settings or the default configuration.
 */
export function getSiteSettings(): SiteSettings {
  // If running on the server (SSR), return default settings immediately
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;

  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        carouselSlides: parsed.carouselSlides && Array.isArray(parsed.carouselSlides) && parsed.carouselSlides.length > 0
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
 * Persists updated site settings to localStorage and dispatches a global
 * 'site-settings-changed' DOM event to trigger instant re-renders in listening components.
 * 
 * @param {SiteSettings} settings - The updated site settings to save.
 */
export function saveSiteSettings(settings: SiteSettings): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      // Dispatch browser event so Header, Hero, and BackgroundVideo update immediately without a page refresh
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
