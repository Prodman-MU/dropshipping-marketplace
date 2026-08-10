"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Play, Pause, Sparkles } from "lucide-react";

interface BackgroundVideoProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function BackgroundVideo({ isEnabled, onToggle }: BackgroundVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[440px] bg-[#111111] border-2 border-[#111111] shadow-[6px_6px_0px_#111111] group overflow-hidden">
      {/* Subtle Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10 pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 z-20 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

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
        <div className="absolute inset-0 w-full h-full bg-[#111111] flex items-center justify-center">
          <div className="text-[#E5E5E0] font-mono text-xs uppercase tracking-widest border border-[#E5E5E0]/30 px-4 py-2">
            Ambient Hero Video Off
          </div>
        </div>
      )}

      {/* Floating Toggle Controls Bar inside video container bottom-right */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 bg-[#111111] text-white border-2 border-[#111111] px-3.5 py-1.5 shadow-[4px_4px_0px_#FFB703]">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#FFB703] font-black tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#FFB703]" />
          <span className="hidden sm:inline">HERO VIDEO 2026</span>
        </div>

        <button
          onClick={onToggle}
          className={`flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 border transition-all uppercase ${
            isEnabled
              ? "bg-[#FFB703] text-[#111111] border-[#111111]"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          }`}
        >
          {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{isEnabled ? "ON" : "OFF"}</span>
        </button>

        {isEnabled && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-white hover:text-[#FFB703] transition-colors"
            title={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}


