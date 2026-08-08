"use client";

import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Eye, EyeOff, Play, Pause, Sparkles } from "lucide-react";

interface BackgroundVideoProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export function BackgroundVideo({ isEnabled, onToggle }: BackgroundVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const { scrollY } = useScroll();

  // Scroll reactive transforms - 100% original video opacity at top
  const videoOpacity = useTransform(scrollY, [0, 600, 1200], [1.0, 0.75, 0.35]);
  const videoScale = useTransform(scrollY, [0, 1000], [1, 1.05]);

  return (
    <div className="fixed inset-x-0 top-20 bottom-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Light bottom fade to transition smoothly into product grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10" />

      {/* Grid Tech Lines Overlay */}
      <div 
        className="absolute inset-0 z-20 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Ambient Video or Canvas Renderer */}
      {isEnabled && (
        <motion.div
          style={{ opacity: videoOpacity, scale: videoScale }}
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-top"
          >
            {/* Local custom asset placed in public/assets/ */}
            <source
              src="/assets/masters_union_dropshipping_v1.mp4"
              type="video/mp4"
            />
            {/* Fallback ambient tech loop */}
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-and-code-41539-large.mp4"
              type="video/mp4"
            />
          </video>
        </motion.div>
      )}

      {/* Floating Toggle Controls Bar in bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center gap-2 bg-[#121216]/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-full shadow-2xl">
        <div className="flex items-center gap-1.5 px-2 text-[11px] font-mono text-amber-400 font-semibold tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>AMBIENT VIDEO</span>
        </div>

        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
            isEnabled
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
              : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
          }`}
        >
          {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isEnabled ? "ON" : "OFF"}</span>
        </button>

        {isEnabled && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            title={isPlaying ? "Pause Ambient Loop" : "Play Ambient Loop"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
