/**
 * @file Header.tsx
 * @description Sticky Frosted Glass Navigation Bar & Marketplace Header.
 * 
 * Gallery-grade header inspired by Apple Store & MR PORTER:
 * - Frosted glass backdrop blur (`glass-header`)
 * - Monochrome crisp Masters' Union typography & JetBrains Mono micro-badge
 * - Live catalog status indicators
 * - Minimalist pill navigation actions
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Store, ShieldCheck, Menu, X, LayoutGrid, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

/**
 * Props for the Header component
 */
interface HeaderProps {
  /** Count of active approved merchant vendors */
  activeVendorCount?: number;
  /** Total count of live synced products in the catalog */
  totalSyncedProducts?: number;
  /** When true, renders a minimalist back button */
  showBackButton?: boolean;
  /** Optional callback to trigger store status modal */
  onOpenStoreStatus?: () => void;
}

/**
 * Main application header component with modern gallery aesthetic.
 */
export function Header({
  activeVendorCount,
  totalSyncedProducts,
  showBackButton = false,
  onOpenStoreStatus,
}: HeaderProps) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSettings(getSiteSettings());
    const handleSettingsChange = () => setSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header transition-all">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Left Container: Back Button (if enabled) + Clickable Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {showBackButton && (
                <Link
                  href="/"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-neutral-200/80 bg-white/80 hover:bg-neutral-100 flex items-center justify-center text-neutral-800 hover:text-black transition shadow-xs cursor-pointer shrink-0"
                  title="Back to Marketplace"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2]" />
                </Link>
              )}

              {/* Blackbox GIF Logo */}
              <Link href="/" className="flex items-center group cursor-pointer shrink-0">
                <div className="bg-black px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-3 group-hover:opacity-90 transition-all shadow-xs">
                  <img
                    src="/assets/logoanimationblack.gif"
                    alt="Masters Union Dropshipping"
                    className="h-5 sm:h-7 md:h-8 w-auto max-w-[85px] sm:max-w-[190px] object-contain"
                  />
                  <span className="font-mono text-[8px] sm:text-xs font-semibold text-white/90 tracking-wider uppercase whitespace-nowrap">
                    / DROPSHIPPING {settings.dropshippingYear}
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Container: Desktop Nav Actions & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Desktop Direct Links */}
              <div className="hidden md:flex items-center gap-2.5">
                {typeof totalSyncedProducts === "number" && (
                  <span className="font-mono text-[11px] text-neutral-500 px-3 py-1 rounded-full bg-neutral-100/80 border border-neutral-200/60">
                    {totalSyncedProducts} Curated Items
                  </span>
                )}

                {onOpenStoreStatus && (
                  <button
                    type="button"
                    onClick={onOpenStoreStatus}
                    className="pill-btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Store Status</span>
                  </button>
                )}

                <Link
                  href="/vendor"
                  className="pill-btn-secondary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:border-black"
                >
                  <Store className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Vendor Portal</span>
                </Link>

                <Link
                  href="/admin"
                  className="pill-btn-secondary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:border-black"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Admin Desk</span>
                </Link>
              </div>

              {/* Mobile Quick Status Badge */}
              {typeof totalSyncedProducts === "number" && (
                <span className="font-mono text-[10px] text-neutral-500 px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/60 md:hidden">
                  {totalSyncedProducts} items
                </span>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 transition cursor-pointer md:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open navigation menu"}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Slide-in Sheet Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 pb-safe"
            >
              {/* Sheet Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-semibold text-neutral-400 uppercase tracking-widest block">
                      NAVIGATION
                    </span>
                    <h3 className="font-editorial text-xl text-neutral-950 font-normal">
                      Marketplace
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="space-y-2 pt-2">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-900 flex items-center gap-3 transition"
                  >
                    <LayoutGrid className="w-4 h-4 text-neutral-600 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold block">Curated Catalog</span>
                      <span className="text-[10px] text-neutral-500 font-mono">Browse all verified products</span>
                    </div>
                  </Link>

                  {onOpenStoreStatus && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenStoreStatus();
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-900 flex items-center gap-3 transition text-left cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold block">Store Status & Link</span>
                        <span className="text-[10px] text-neutral-500 font-mono">Verify merchant integration</span>
                      </div>
                    </button>
                  )}

                  <Link
                    href="/vendor"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-900 flex items-center gap-3 transition"
                  >
                    <Store className="w-4 h-4 text-neutral-600 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold block">Vendor Portal</span>
                      <span className="text-[10px] text-neutral-500 font-mono">Manage catalog & sync products</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-900 flex items-center gap-3 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-neutral-600 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold block">Admin Desk</span>
                      <span className="text-[10px] text-neutral-500 font-mono">Store moderation & carousel</span>
                    </div>
                  </Link>
                </nav>
              </div>

              {/* Sheet Bottom Footer */}
              <div className="pt-6 border-t border-neutral-100 space-y-3 font-mono text-[11px] text-neutral-500">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <div className="text-neutral-700 font-semibold uppercase text-[10px]">
                    Catalog Stats
                  </div>
                  <div>Verified Stores: {activeVendorCount ?? "—"}</div>
                  <div>Live Products: {totalSyncedProducts ?? "—"}</div>
                </div>
                <div className="text-center text-[10px] text-neutral-400">
                  © {settings.dropshippingYear} {settings.siteTitle}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

