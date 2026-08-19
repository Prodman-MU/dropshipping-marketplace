/**
 * @file seed-prod.ts
 * @description Production & Cloud Database Seeding Pipeline.
 * 
 * Executes ONLY the essential baseline configuration (e.g. `site_settings`)
 * without polluting the production database with mock merchants, fake products,
 * or simulated inventory.
 */

import { prisma } from "../lib/prisma";
import { seedSiteSettings } from "./seed-settings";

async function main() {
  console.log("🚀 Starting Production Database Seeding...");

  // Seed only the required website settings
  await seedSiteSettings();

  console.log("✅ Production database initialized successfully with 0 mock products!");
}

main()
  .catch((e) => {
    console.error("❌ Error during production seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
