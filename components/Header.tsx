"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

interface HeaderProps {
  activeVendorCount?: number;
  totalSyncedProducts?: number;
  showBackButton?: boolean;
}

export function Header({
  activeVendorCount = 0,
  totalSyncedProducts = 0,
  showBackButton = false,
}: HeaderProps) {
  const [imgError, setImgError] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSettingsChange = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F4F4F0]/95 backdrop-blur-md border-b-2 border-[#111111] transition-all">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Left Container: Back Button (if enabled) + Clickable Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            {showBackButton && (
              <Link
                href="/"
                className="p-1.5 sm:p-2.5 bg-[#FFB703] hover:bg-[#111111] hover:text-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center shrink-0"
                title="Back to Marketplace"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
              </Link>
            )}

            {/* Clickable Logo */}
            <Link href="/" className="flex items-center group cursor-pointer shrink-0">
              {!imgError ? (
                <div className="bg-[#111111] px-2 sm:px-3.5 py-1.5 sm:py-2 border-2 border-[#111111] shadow-[2px_2px_0px_#FFB703] sm:shadow-[4px_4px_0px_#FFB703] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform flex items-center gap-1.5 sm:gap-3">
                  <img
                    src="/assets/logoanimationblack.gif"
                    alt="Masters Union Dropshipping"
                    onError={() => setImgError(true)}
                    className="h-5 sm:h-8 md:h-9 w-auto max-w-[90px] sm:max-w-[200px] object-contain"
                  />
                  <span className="font-mono text-[9px] sm:text-xs font-black text-[#FFB703] tracking-wider uppercase whitespace-nowrap">
                    / DROPSHIPPING {settings.dropshippingYear}
                  </span>
                </div>
              ) : (
                <div className="bg-[#111111] px-2 sm:px-4 py-1.5 sm:py-2 border-2 border-[#111111] shadow-[2px_2px_0px_#FFB703] flex items-center gap-1.5 sm:gap-3">
                  <div className="w-5 h-5 sm:w-8 sm:h-8 bg-[#D62828] border border-white flex items-center justify-center font-display font-black text-[10px] sm:text-sm text-white shrink-0">
                    MU
                  </div>
                  <span className="font-mono text-[9px] sm:text-xs font-black text-[#FFB703] tracking-wider uppercase whitespace-nowrap">
                    {settings.siteTitle} / DROPSHIPPING {settings.dropshippingYear}
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Right: Approved Stores & Live Products Ticker */}
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-[#E5E5E0] border-2 border-[#111111] text-[9px] sm:text-xs font-mono font-bold shadow-[2px_2px_0px_#111111] shrink-0">
            <Layers className="w-3.5 h-3.5 text-[#005F73] shrink-0" />
            <span className="text-[#111111]">
              <strong>{activeVendorCount}</strong>
              <span className="hidden sm:inline"> Approved Stores</span>
              <span className="sm:hidden"> Stores</span>
            </span>
            <span className="text-[#111111] font-black">•</span>
            <span className="text-[#005F73]">
              <strong>{totalSyncedProducts}</strong>
              <span className="hidden sm:inline"> Live Products</span>
              <span className="sm:hidden"> Products</span>
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
