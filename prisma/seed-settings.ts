/**
 * @file seed-settings.ts
 * @description Shared Seeding Function for Default Website & Branding Settings.
 * 
 * Inserts the baseline `site_settings` row required by the UI header, announcement ticker,
 * and metadata across all environments (both local development and production/cloud).
 */

import { prisma } from "../lib/prisma";

/**
 * Upserts the default site_settings row.
 * Idempotent: Skips if the default settings row already exists.
 */
export async function seedSiteSettings() {
  console.log("⚙️ Seeding default website settings...");

  const settings = await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      dropshippingYear: "2026",
      siteTitle: "MASTERS UNION",
      announcementText: "2026 B2B DIRECT DROPSHIPPING CATALOG",
      catalogBadgeText: "OFFICIAL CATALOG",
    },
  });

  console.log(`✅ Default website settings initialized: "${settings.siteTitle}" (${settings.dropshippingYear})`);
  return settings;
}
