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
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[420px] rounded-3xl overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl group">
      {/* Subtle Bottom Fade Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />

      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 z-20 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Ambient Video */}
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
            src="/assets/masters_union_dropshipping_v1.mp4"
            type="video/mp4"
          />
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4"
            type="video/mp4"
          />
        </video>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950 flex items-center justify-center">
          <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest">
            Ambient Video Off
          </div>
        </div>
      )}

      {/* Floating Toggle Controls Bar inside video container bottom-right */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-full shadow-lg">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 font-semibold tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span className="hidden sm:inline">HERO VIDEO</span>
        </div>

        <button
          onClick={onToggle}
          className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full transition-all ${
            isEnabled
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{isEnabled ? "ON" : "OFF"}</span>
        </button>

        {isEnabled && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            title={isPlaying ? "Pause Ambient Loop" : "Play Ambient Loop"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}

