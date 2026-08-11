export interface CarouselSlide {
  id: string;
  type: "svg" | "image" | "video" | "image_ad" | "video_ad";
  badge: string;
  title?: string;
  subtitle?: string;
  mediaSrc?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface SiteSettings {
  dropshippingYear: string;
  siteTitle: string;
  announcementText: string;
  catalogBadgeText: string;
  carouselSlides: CarouselSlide[];
}

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

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  dropshippingYear: "2026",
  siteTitle: "MASTERS UNION",
  announcementText: "MASTERS UNION PMC — STUDENT-CURATED DROPSHIPPING NETWORK",
  catalogBadgeText: "OFFICIAL CATALOG",
  carouselSlides: DEFAULT_CAROUSEL_SLIDES,
};

const SETTINGS_KEY = "dropshipping_marketplace_site_settings";

export function getSiteSettings(): SiteSettings {
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

