"use client";

import React, { useState, useEffect } from "react";
import { BackgroundVideo } from "@/components/BackgroundVideo";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

interface HeroProps {
  isVideoEnabled: boolean;
  onToggleVideo: () => void;
}

export function Hero({
  isVideoEnabled,
  onToggleVideo,
}: HeroProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSettingsChange = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  return (
    <section className="relative bg-[#F4F4F0] border-b-2 border-[#111111] py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Central Hero Video Frame */}
        <div className="bauhaus-card p-3 sm:p-6 bg-grid-pattern relative min-h-[380px] sm:min-h-[480px] flex flex-col justify-between overflow-hidden">
          
          {/* Header Overlay */}
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs font-bold border-2 border-[#111111] py-2.5 px-4 bg-white shadow-[3px_3px_0px_#111111] mb-4 z-20">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 bg-[#D62828] text-white font-black text-[11px] uppercase tracking-wider">
                MASTERS UNION PMC
              </span>
              <span className="text-[#111111] font-black uppercase tracking-tight">
                {settings.announcementText}
              </span>
              <span className="hidden md:inline text-[#005F73] font-bold">
                • SOURCED FROM ARTISANAL & MANUFACTURING HUBS ACROSS INDIA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#FFB703] border border-[#111111] text-[#111111] text-[11px] font-black uppercase">
                {settings.dropshippingYear} {settings.catalogBadgeText}
              </span>
            </div>
          </div>

          {/* Contained Hero Video */}
          <div className="w-full flex-1 min-h-[320px] sm:min-h-[400px]">
            <BackgroundVideo isEnabled={isVideoEnabled} onToggle={onToggleVideo} />
          </div>

        </div>

      </div>
    </section>
  );
}




