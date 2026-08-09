"use client";

import React from "react";
import { BackgroundVideo } from "@/components/BackgroundVideo";

interface HeroProps {
  isVideoEnabled: boolean;
  onToggleVideo: () => void;
  activeVendorCount?: number;
  totalSyncedProducts?: number;
}

export function Hero({
  isVideoEnabled,
  onToggleVideo,
}: HeroProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      <div className="relative w-full rounded-3xl overflow-hidden h-[340px] sm:h-[440px] shadow-2xl">
        {/* Contained Hero Video */}
        <BackgroundVideo isEnabled={isVideoEnabled} onToggle={onToggleVideo} />
      </div>
    </section>
  );
}


