"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AnimatedSquiggle } from "@/components/AnimatedSquiggle";
import { MastersUnionLogo } from "@/components/MastersUnionLogo";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Video } from "lucide-react";

interface HeroProps {
  isVideoEnabled?: boolean;
  onToggleVideo?: () => void;
}

export function Hero({ isVideoEnabled, onToggleVideo }: HeroProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSettingsChange = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  const slides = settings.carouselSlides || DEFAULT_SITE_SETTINGS.carouselSlides;

  // Ensure current index is within valid bounds when slides change
  const activeIndex = Math.min(currentIndex, Math.max(0, slides.length - 1));
  const activeSlide = slides[activeIndex] || slides[0];

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-switch slide every 5.6 seconds (5600 ms)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5600);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, slides.length]);

  if (!activeSlide) return null;

  return (
    <section className="relative bg-[#F4F4F0] border-b-2 border-[#111111] py-4 sm:py-6 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-5">
        
        {/* Central Hero Canvas Frame - Fixed height container */}
        <div 
          className="bg-white p-3 sm:p-6 bg-grid-pattern relative h-[380px] sm:h-[480px] flex flex-col justify-between items-center overflow-hidden border-2 border-[#111111] shadow-[5px_5px_0px_#111111]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
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

          {/* Top Badge Overlay */}
          <div className="relative z-20 w-full flex items-center justify-between font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2">
            <span className="px-2.5 py-1 bg-[#D62828] text-white border border-[#111111] shadow-[2px_2px_0px_#111111]">
              {activeSlide.badge || "MASTERS UNION PMC"}
            </span>
            <span className="px-2.5 py-1 bg-[#FFB703] text-[#111111] border border-[#111111] shadow-[2px_2px_0px_#111111]">
              SLIDE {activeIndex + 1} / {slides.length} • {slides.length > 1 ? "5.6s ROTATION" : "ADMIN CONFIGURED"}
            </span>
          </div>

          {/* Main Carousel Slides Area */}
          <div className="relative z-20 w-full max-w-4xl flex-1 flex flex-col items-center justify-center text-center py-2 h-full overflow-hidden">
            <AnimatePresence mode="wait">
              {activeSlide.type === "svg" ? (
                /* Slide Type 1: Masters' Union Logo + Animated SVG Squiggle */
                <motion.div
                  key={`slide-svg-${activeIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full h-full flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3"
                >
                  <MastersUnionLogo
                    showSubtitle={true}
                    subtitleText={activeSlide.subtitle || `dropshipping ${settings.dropshippingYear || "2026"}`}
                  />

                  <div className="w-full mt-1 sm:mt-2">
                    <AnimatedSquiggle key={`squiggle-${activeIndex}`} />
                  </div>
                </motion.div>
              ) : activeSlide.type === "image_ad" ? (
                /* Slide Type 2: Full-Width Image Ad */
                <motion.div
                  key={`slide-img-ad-${activeSlide.id}-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full h-full relative rounded border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden group bg-[#111111]"
                >
                  <Image
                    src={activeSlide.mediaSrc || "/assets/wp1959356-mob-psycho-100-wallpapers.jpg"}
                    alt={activeSlide.title || "Featured Image Ad"}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                  {/* Ad Overlay Text */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-left font-mono">
                    <div className="space-y-1 max-w-xl">
                      <span className="px-2.5 py-0.5 bg-[#FFB703] text-[#111111] font-black text-[10px] uppercase border border-[#111111] shadow-[1px_1px_0px_#111111]">
                        FEATURED DISPLAY AD
                      </span>
                      {activeSlide.title && (
                        <h2 className="text-lg sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                          {activeSlide.title}
                        </h2>
                      )}
                      {activeSlide.subtitle && (
                        <p className="text-xs text-gray-200 font-semibold line-clamp-2">
                          {activeSlide.subtitle}
                        </p>
                      )}
                    </div>

                    {activeSlide.ctaText && (
                      <a
                        href={activeSlide.ctaLink || "#product-catalog"}
                        className="px-4 py-2 bg-[#D62828] text-white border-2 border-white font-mono text-xs font-black uppercase hover:bg-[#FFB703] hover:text-[#111111] shadow-[3px_3px_0px_#111111] shrink-0 transition-all"
                      >
                        {activeSlide.ctaText} →
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : activeSlide.type === "video_ad" ? (
                /* Slide Type 3: Full-Width Video Ad */
                <motion.div
                  key={`slide-vid-ad-${activeSlide.id}-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full h-full relative rounded border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden bg-[#111111]"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    src={activeSlide.mediaSrc || "/assets/masters_union_dropshipping_v1.mp4"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Video Ad Overlay Text */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-left font-mono">
                    <div className="space-y-1 max-w-xl">
                      <span className="px-2.5 py-0.5 bg-[#005F73] text-white font-black text-[10px] uppercase border border-white shadow-[1px_1px_0px_#111111]">
                        FEATURED VIDEO AD
                      </span>
                      {activeSlide.title && (
                        <h2 className="text-lg sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                          {activeSlide.title}
                        </h2>
                      )}
                      {activeSlide.subtitle && (
                        <p className="text-xs text-gray-200 font-semibold line-clamp-2">
                          {activeSlide.subtitle}
                        </p>
                      )}
                    </div>

                    {activeSlide.ctaText && (
                      <a
                        href={activeSlide.ctaLink || "#product-catalog"}
                        className="px-4 py-2 bg-[#FFB703] text-[#111111] border-2 border-[#111111] font-mono text-xs font-black uppercase hover:bg-white shadow-[3px_3px_0px_#111111] shrink-0 transition-all"
                      >
                        {activeSlide.ctaText} →
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : activeSlide.type === "video" ? (
                /* Slide Type 4: Text + Video Slide */
                <motion.div
                  key={`slide-vid-${activeSlide.id}-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-6 px-2 sm:px-6 py-2"
                >
                  <div className="relative w-full md:w-1/2 h-44 sm:h-60 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden bg-[#111111]">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      src={activeSlide.mediaSrc || "/assets/masters_union_dropshipping_v1.mp4"}
                    />
                  </div>

                  <div className="w-full md:w-1/2 text-left space-y-3 font-mono">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFB703] border border-[#111111] text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#111111]">
                      <Video className="w-3 h-3 text-[#D62828]" />
                      <span>FEATURED VIDEO</span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-black text-[#111111] font-display uppercase leading-tight tracking-tight">
                      {activeSlide.title || "FEATURED VIDEO HIGHLIGHT"}
                    </h2>

                    <p className="text-xs font-semibold text-[#2B2D42] leading-relaxed">
                      {activeSlide.subtitle || "Direct video preview configured via Admin Settings portal."}
                    </p>

                    {activeSlide.ctaText && (
                      <a
                        href={activeSlide.ctaLink || "#product-catalog"}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-[#FFB703] border-2 border-[#111111] font-mono text-xs font-black uppercase tracking-wider hover:bg-[#FFB703] hover:text-[#111111] shadow-[3px_3px_0px_#111111] transition-all"
                      >
                        <span>{activeSlide.ctaText}</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Slide Type 5: Text + Image Slide */
                <motion.div
                  key={`slide-img-${activeSlide.id}-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-6 px-2 sm:px-6 py-2"
                >
                  <div className="relative w-full md:w-1/2 h-44 sm:h-60 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden group bg-[#F4F4F0]">
                    <Image
                      src={activeSlide.mediaSrc || "/assets/wp1959356-mob-psycho-100-wallpapers.jpg"}
                      alt={activeSlide.title || "Featured Showcase"}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                  </div>

                  <div className="w-full md:w-1/2 text-left space-y-3 font-mono">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFB703] border border-[#111111] text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_#111111]">
                      <Sparkles className="w-3 h-3 text-[#D62828]" />
                      <span>FEATURED SHOWCASE</span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-black text-[#111111] font-display uppercase leading-tight tracking-tight">
                      {activeSlide.title || "FEATURED CATALOG HIGHLIGHT"}
                    </h2>

                    <p className="text-xs font-semibold text-[#2B2D42] leading-relaxed">
                      {activeSlide.subtitle || "Curated merchandise directly sourced for Masters Union student merchants."}
                    </p>

                    {activeSlide.ctaText && (
                      <a
                        href={activeSlide.ctaLink || "#product-catalog"}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] text-[#FFB703] border-2 border-[#111111] font-mono text-xs font-black uppercase tracking-wider hover:bg-[#FFB703] hover:text-[#111111] shadow-[3px_3px_0px_#111111] transition-all"
                      >
                        <span>{activeSlide.ctaText}</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Carousel Controls & 5.6s Progress Indicator */}
          {slides.length > 1 && (
            <div className="relative z-20 w-full max-w-md pt-2 flex flex-col items-center gap-2">
              {/* Progress Bar (5.6s fill animation) */}
              <div className="w-full h-1.5 bg-[#E5E5E0] border border-[#111111] overflow-hidden">
                <motion.div
                  key={`progress-${activeIndex}-${isPaused}`}
                  initial={{ width: "0%" }}
                  animate={{ width: isPaused ? "0%" : "100%" }}
                  transition={{ duration: isPaused ? 0 : 5.6, ease: "linear" }}
                  className="h-full bg-[#D62828]"
                />
              </div>

              {/* Manual Slide Dots & Arrows */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevSlide}
                  className="p-1 bg-white hover:bg-[#FFB703] text-[#111111] border border-[#111111] shadow-[2px_2px_0px_#111111] transition-colors"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>

                <div className="flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2.5 transition-all border border-[#111111] ${
                        activeIndex === idx
                          ? "w-8 bg-[#111111] shadow-[1px_1px_0px_#FFB703]"
                          : "w-2.5 bg-[#E5E5E0] hover:bg-[#FFB703]"
                      }`}
                      title={`Go to Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="p-1 bg-white hover:bg-[#FFB703] text-[#111111] border border-[#111111] shadow-[2px_2px_0px_#111111] transition-colors"
                  title="Next Slide"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}

