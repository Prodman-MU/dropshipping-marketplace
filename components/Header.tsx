"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers } from "lucide-react";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

interface HeaderProps {
  activeVendorCount: number;
  totalSyncedProducts: number;
}

export function Header({
  activeVendorCount,
  totalSyncedProducts,
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Top Left Clickable Logo */}
          <Link href="/" className="flex items-center group cursor-pointer">
            {!imgError ? (
              <div className="bg-[#111111] px-3.5 py-2 border-2 border-[#111111] shadow-[4px_4px_0px_#FFB703] group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform flex items-center gap-3">
                <img
                  src="/assets/logoanimationblack.gif"
                  alt="Masters Union Dropshipping"
                  onError={() => setImgError(true)}
                  className="h-9 w-auto max-w-[200px] object-contain"
                />
                <div className="h-5 w-0.5 bg-[#FFB703]" />
                <span className="font-mono text-xs font-black text-[#FFB703] tracking-wider uppercase">
                  / DROPSHIPPING {settings.dropshippingYear}
                </span>
              </div>
            ) : (
              <div className="bg-[#111111] px-4 py-2 border-2 border-[#111111] shadow-[4px_4px_0px_#FFB703] flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D62828] border border-white flex items-center justify-center font-display font-black text-sm text-white">
                  MU
                </div>
                <span className="font-mono text-xs font-black text-[#FFB703] tracking-wider uppercase">
                  {settings.siteTitle} / DROPSHIPPING {settings.dropshippingYear}
                </span>
              </div>
            )}
          </Link>

          {/* Right: Approved Stores & Live Products Ticker */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#E5E5E0] border-2 border-[#111111] text-xs font-mono font-bold shadow-[2px_2px_0px_#111111]">
            <Layers className="w-4 h-4 text-[#005F73]" />
            <span className="text-[#111111]">{activeVendorCount} Approved Stores</span>
            <span className="text-[#111111] font-black">•</span>
            <span className="text-[#005F73]">{totalSyncedProducts} Live Products</span>
          </div>

        </div>
      </div>
    </header>
  );
}





