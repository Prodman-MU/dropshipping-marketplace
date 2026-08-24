/**
 * @file Header.tsx
 * @description Sticky Frosted Glass Navigation Bar & Marketplace Header.
 * 
 * Gallery-grade header inspired by Apple Store & MR PORTER:
 * - Frosted glass backdrop blur (`glass-header`)
 * - Monochrome crisp Masters' Union typography & JetBrains Mono micro-badge
 * - Live catalog status indicators
 * - Minimalist pill navigation actions
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Store, ShieldCheck } from "lucide-react";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

/**
 * Props for the Header component
 */
interface HeaderProps {
  /** Count of active approved merchant vendors */
  activeVendorCount?: number;
  /** Total count of live synced products in the catalog */
  totalSyncedProducts?: number;
  /** When true, renders a minimalist back button */
  showBackButton?: boolean;
}

/**
 * Main application header component with modern gallery aesthetic.
 */
export function Header({
  activeVendorCount,
  totalSyncedProducts,
  showBackButton = false,
}: HeaderProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSettingsChange = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Left Container: Back Button (if enabled) + Clickable Logo */}
          <div className="flex items-center gap-3 shrink-0">
            {showBackButton && (
              <Link
                href="/"
                className="w-9 h-9 rounded-full border border-neutral-200/80 bg-white/80 hover:bg-neutral-100 flex items-center justify-center text-neutral-800 hover:text-black transition shadow-xs"
                title="Back to Marketplace"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2]" />
              </Link>
            )}

            {/* Blackbox GIF Logo */}
            <Link href="/" className="flex items-center group cursor-pointer shrink-0">
              <div className="bg-black px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-2 sm:gap-3 group-hover:opacity-90 transition-all shadow-xs">
                <img
                  src="/assets/logoanimationblack.gif"
                  alt="Masters Union Dropshipping"
                  className="h-5 sm:h-7 md:h-8 w-auto max-w-[100px] sm:max-w-[190px] object-contain"
                />
                <span className="font-mono text-[9px] sm:text-xs font-semibold text-white/90 tracking-wider uppercase whitespace-nowrap">
                  / DROPSHIPPING {settings.dropshippingYear}
                </span>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
