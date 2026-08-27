/**
 * @file Hero.tsx
 * @description Apple x MR PORTER Hybrid Hero Section & Editorial Breakout Carousel.
 * 
 * Features:
 * - Animated SVG Squiggle & Masters' Union Brand Showcase Carousel Slide
 * - Subtle off-white (`#F8F9FA`) framed canvas with generous padding
 * - Clean slide transitions powered by Framer Motion
 * - Support for all dynamic Admin slide types (SVG Squiggle, image ads, video ads, showcases)
 * - Minimalist hairline progress indicators and matte black pill CTAs
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AnimatedSquiggle } from "@/components/AnimatedSquiggle";
import { MastersUnionLogo } from "@/components/MastersUnionLogo";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Video, ArrowUpRight } from "lucide-react";

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

  // Auto-switch slide every 5.6 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5600);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, slides.length]);

  if (!activeSlide) return null;

  return (
    <section className="relative bg-white py-4 sm:py-8 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Central Hero Frame - Off-white editorial card with consistent adaptive height */}
        <div 
          className="relative bg-[#F8F9FA] rounded-2xl sm:rounded-3xl border border-neutral-200/70 p-4 sm:p-8 md:p-10 min-h-[460px] sm:min-h-[480px] md:h-[520px] flex flex-col justify-between overflow-hidden shadow-xs"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
          {/* Main Carousel Slide Area with stable viewport */}
          <div className="relative z-20 w-full flex-1 flex flex-col items-center justify-center my-auto py-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeSlide.type === "svg" ? (
                /* Slide Type 1: Masters' Union Logo + Animated SVG Squiggle */
                <motion.div
                  key={`slide-svg-${activeIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-4xl flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 my-auto h-full"
                >
                  <MastersUnionLogo
                    showSubtitle={true}
                    subtitleText={activeSlide.subtitle || `dropshipping ${settings.dropshippingYear || "2026"}`}
                  />

                  <div className="w-full mt-2 sm:mt-3">
                    <AnimatedSquiggle key={`squiggle-${activeIndex}`} />
                  </div>
                </motion.div>
              ) : activeSlide.type === "image_ad" ? (
                /* Slide Type 2: Full-Width Image Ad */
                <motion.div
                  key={`slide-img-ad-${activeSlide.id}-${activeIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full min-h-[260px] max-h-[340px] sm:max-h-[380px] md:max-h-[400px] relative rounded-xl sm:rounded-2xl border border-neutral-200/80 overflow-hidden group bg-neutral-900"
                >
                  <Image
                    src={activeSlide.mediaSrc || "/assets/wp1959356-mob-psycho-100-wallpapers.jpg"}
                    alt={activeSlide.title || "Featured Image"}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                  {/* Ad Overlay Text */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 text-left">
                    <div className="space-y-1 sm:space-y-1.5 max-w-xl">
                      <span className="status-pill bg-white text-black border-none text-[9px] sm:text-[10px]">
                        FEATURED COLLECTION
                      </span>
                      {activeSlide.title && (
                        <h2 className="font-editorial text-xl sm:text-3xl md:text-4xl text-white font-normal leading-tight line-clamp-2">
                          {activeSlide.title}
                        </h2>
                      )}
                      {activeSlide.subtitle && (
                        <p className="text-[11px] sm:text-sm text-neutral-300 font-normal line-clamp-2">
                          {activeSlide.subtitle}
                        </p>
                      )}
                    </div>

                    {activeSlide.ctaText && (
                      <a
                        href={activeSlide.ctaLink || "#product-catalog"}
                        className="pill-btn-primary bg-white text-black hover:bg-neutral-100 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-medium uppercase tracking-wider shrink-0 w-fit"
                      >
                        {activeSlide.ctaText}
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
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full min-h-[260px] max-h-[340px] sm:max-h-[380px] md:max-h-[400px] relative rounded-xl sm:rounded-2xl border border-neutral-200/80 overflow-hidden bg-black"
                >
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    src={activeSlide.mediaSrc || "/assets/masters_union_dropshipping_v1.mp4"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 sm:bottom-6 sm:left-6 sm:right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 text-left">
                    <div className="space-y-1 sm:space-y-1.5 max-w-xl">
                      <span className="status-pill bg-white text-black border-none text-[9px] sm:text-[10px]">
                        VIDEO SHOWCASE
                      </span>
                      {activeSlide.title && (
                        <h2 className="font-editorial text-xl sm:text-3xl md:text-4xl text-white font-normal leading-tight line-clamp-2">
                          {activeSlide.title}
                        </h2>
                      )}
                      {activeSlide.subtitle && (
                        <p className="text-[11px] sm:text-sm text-neutral-300 font-normal line-clamp-2">
                          {activeSlide.subtitle}
                        </p>
                      )}
                    </div>

                    {activeSlide.ctaText && (
                      <a
                        href={activeSlide.ctaLink || "#product-catalog"}
                        className="pill-btn-primary bg-white text-black hover:bg-neutral-100 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-medium uppercase tracking-wider shrink-0 w-fit"
                      >
                        {activeSlide.ctaText}
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : activeSlide.type === "video" ? (
                /* Slide Type 4: Text + Video Split Layout */
                <motion.div
                  key={`slide-vid-${activeSlide.id}-${activeIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-10 my-auto"
                >
                  <div className="relative w-full md:w-1/2 h-36 sm:h-56 md:h-72 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200/80 shadow-xs shrink-0">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      src={activeSlide.mediaSrc || "/assets/masters_union_dropshipping_v1.mp4"}
                    />
                  </div>

                  <div className="w-full md:w-1/2 text-left space-y-2 sm:space-y-4">
                    <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                      FEATURED CAMPAIGN
                    </span>

                    <h2 className="font-editorial text-xl sm:text-3xl md:text-4xl text-neutral-950 font-normal leading-tight line-clamp-2">
                      {activeSlide.title || "Curated Video Spotlight"}
                    </h2>

                    <p className="text-[11px] sm:text-sm text-neutral-600 leading-relaxed font-normal line-clamp-2 sm:line-clamp-3">
                      {activeSlide.subtitle || "Direct dropshipping showcase curated from our verified supplier network."}
                    </p>

                    {activeSlide.ctaText && (
                      <div className="pt-0.5 sm:pt-1">
                        <a
                          href={activeSlide.ctaLink || "#product-catalog"}
                          className="pill-btn-primary px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-medium uppercase tracking-wider flex items-center gap-2 w-fit"
                        >
                          <span>{activeSlide.ctaText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Slide Type 5: Text + Image Split Layout (MR PORTER Editorial Style) */
                <motion.div
                  key={`slide-img-${activeSlide.id}-${activeIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-10 my-auto"
                >
                  <div className="relative w-full md:w-1/2 h-36 sm:h-56 md:h-72 rounded-xl sm:rounded-2xl overflow-hidden bg-[#F5F5F7] border border-neutral-200/80 shadow-xs shrink-0">
                    <Image
                      src={activeSlide.mediaSrc || "/assets/wp1959356-mob-psycho-100-wallpapers.jpg"}
                      alt={activeSlide.title || "Featured Showcase"}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                  </div>

                  <div className="w-full md:w-1/2 text-left space-y-2 sm:space-y-4">
                    <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
                      EDITORIAL SELECTION
                    </span>

                    <h2 className="font-editorial text-xl sm:text-3xl md:text-4xl text-neutral-950 font-normal leading-tight line-clamp-2">
                      {activeSlide.title || "The Archive Collection"}
                    </h2>

                    <p className="text-[11px] sm:text-sm text-neutral-600 leading-relaxed font-normal line-clamp-2 sm:line-clamp-3">
                      {activeSlide.subtitle || "Curated merchandise directly sourced for Masters Union student merchants."}
                    </p>

                    {activeSlide.ctaText && (
                      <div className="pt-0.5 sm:pt-1">
                        <a
                          href={activeSlide.ctaLink || "#product-catalog"}
                          className="pill-btn-primary px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-medium uppercase tracking-wider flex items-center gap-2 w-fit"
                        >
                          <span>{activeSlide.ctaText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Progress & Slide Switcher (Apple Style) */}
          {slides.length > 1 && (
            <div className="relative z-20 w-full pt-3 sm:pt-4 border-t border-neutral-200/60 flex items-center justify-between">
              {/* Subtle Progress Bar */}
              <div className="w-20 sm:w-32 h-0.5 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  key={`progress-${activeIndex}-${isPaused}`}
                  initial={{ width: "0%" }}
                  animate={{ width: isPaused ? "0%" : "100%" }}
                  transition={{ duration: isPaused ? 0 : 5.6, ease: "linear" }}
                  className="h-full bg-neutral-900"
                />
              </div>

              {/* Minimal Navigation Arrows & Dots */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className="p-1 sm:p-1.5 cursor-pointer"
                      title={`Go to Slide ${idx + 1}`}
                    >
                      <span className={`block h-1.5 rounded-full transition-all ${
                        activeIndex === idx
                          ? "w-5 sm:w-6 bg-neutral-900"
                          : "w-1.5 bg-neutral-300 hover:bg-neutral-500"
                      }`} />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 ml-1 sm:ml-2">
                  <button
                    onClick={prevSlide}
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-black transition cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-black transition cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
