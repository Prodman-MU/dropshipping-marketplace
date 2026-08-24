/**
 * @file BackgroundVideo.tsx
 * @description Apple-Style Ambient Hero Video Component.
 * 
 * Features:
 * - Rounded-3xl container with hairline border
 * - Frosted glass pill control bar in bottom corner
 * - Smooth video transitions & pause controls
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Play, Pause, Sparkles } from "lucide-react";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

interface BackgroundVideoProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function BackgroundVideo({ isEnabled, onToggle }: BackgroundVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSettingsChange = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && isEnabled) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isEnabled]);

  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[440px] bg-neutral-950 rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-xs group overflow-hidden">
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10 pointer-events-none" />

      {/* Hero Video */}
      {isEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700"
        >
          <source
            src="/assets/masters_union_dropshipping_v2.mp4"
            type="video/mp4"
          />
          <source
            src="/assets/masters_union_dropshipping_v1.mp4"
            type="video/mp4"
          />
        </video>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-neutral-900 flex items-center justify-center">
          <div className="text-neutral-400 font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-full border border-neutral-700 bg-neutral-800/80">
            Ambient Video Off
          </div>
        </div>
      )}

      {/* Floating Frosted Glass Controls Bar */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2.5 bg-black/70 backdrop-blur-md text-white border border-white/10 px-3.5 py-1.5 rounded-full shadow-lg">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 font-medium tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-neutral-200" />
          <span className="hidden sm:inline">VIDEO {settings.dropshippingYear}</span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={`flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full transition-all uppercase ${
            isEnabled
              ? "bg-white text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{isEnabled ? "ON" : "OFF"}</span>
        </button>

        {isEnabled && (
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
