"use client";

import React, { useState, useEffect } from "react";
import { AnimatedSquiggle } from "@/components/AnimatedSquiggle";
import { MastersUnionLogo } from "@/components/MastersUnionLogo";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

interface HeroProps {
  isVideoEnabled?: boolean;
  onToggleVideo?: () => void;
}

export function Hero({ isVideoEnabled, onToggleVideo }: HeroProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSettingsChange = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  return (
    <section className="relative bg-[#F4F4F0] border-b-2 border-[#111111] py-4 sm:py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Central Hero Canvas Frame - Borderless inner container */}
        <div className="bg-white p-3 sm:p-8 bg-grid-pattern relative min-h-[260px] sm:min-h-[450px] flex flex-col justify-center items-center overflow-hidden border-2 border-[#111111] shadow-[5px_5px_0px_#111111]">

          {/* Subtle Grid Pattern Overlay */}
          <div
            className="absolute inset-0 z-10 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,17,17,0.06) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Glowing Ambient Spotlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFB703]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Main Hero Content Area - Borderless SVG Container */}
          <div className="relative z-20 w-full max-w-4xl flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3 py-2">

            {/* 1. Masters' Union Logo (Emblem + "masters' union" + "dropshipping 2026") */}
            <MastersUnionLogo
              showSubtitle={true}
              subtitleText={`dropshipping ${settings.dropshippingYear || "2026"}`}
            />

            {/* 2. Animated SVG Squiggle directly below logo */}
            <div className="w-full mt-1 sm:mt-2">
              <AnimatedSquiggle />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}






