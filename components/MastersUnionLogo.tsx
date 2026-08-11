"use client";

import React from "react";
import Image from "next/image";

interface MastersUnionLogoProps {
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
}

export function MastersUnionLogo({
  showSubtitle = true,
  subtitleText = "dropshipping 2026",
  className = "",
}: MastersUnionLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-[#111111] ${className}`}>
      {/* Masters' Union Logo Image (Transparent PNG) */}
      <Image
        src="/assets/Masters_Union_Logo_white_transparent.png"
        alt="Masters' Union"
        width={400}
        height={160}
        priority
        className="h-16 sm:h-24 md:h-28 w-auto object-contain select-none"
      />

      {/* Subtitle Text directly below logo: dropshipping 2026 */}
      {showSubtitle && (
        <div className="mt-2 sm:mt-3 font-display font-black text-xl sm:text-3xl md:text-4xl tracking-tight leading-none text-[#111111] lowercase select-none">
          {subtitleText}
        </div>
      )}
    </div>
  );
}

