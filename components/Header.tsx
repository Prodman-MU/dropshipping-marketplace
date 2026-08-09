"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plus, Activity, Cpu, Layers, ShieldCheck } from "lucide-react";
import { ConnectStoreModal } from "@/components/ConnectStoreModal";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeVendorCount: number;
  totalSyncedProducts: number;
  isVideoEnabled: boolean;
  onToggleVideo: () => void;
  onAddStore: (domain: string, token?: string) => Promise<void> | void;
}

export function Header({
  searchQuery,
  onSearchChange,
  activeVendorCount,
  totalSyncedProducts,
  isVideoEnabled,
  onToggleVideo,
  onAddStore,
}: HeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Top Left Clickable Animated GIF Logo */}
            <Link href="/" className="flex items-center group cursor-pointer">
              {!imgError ? (
                <img
                  src="/assets/logoanimationblack.gif"
                  alt="Homepage"
                  onError={() => setImgError(true)}
                  className="h-11 w-auto max-w-[200px] object-contain rounded-xl group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <Cpu className="w-5 h-5 text-black font-bold" />
                </div>
              )}
            </Link>

            {/* Middle Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search Product Title, SKU, or Vendor Domain..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-[#13151D]/90 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            {/* Right Action Bar & Metrics */}
            <div className="flex items-center gap-3">
              {/* Webhook Sync Status Pill */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-zinc-300">WEBHOOKS:</span>
                <span className="text-amber-400 font-bold">ONLINE</span>
              </div>

              {/* Access Controlled Admin Portal Link */}
              <Link
                href="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-all"
                title="Access Controlled Admin Moderation Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
              </Link>

              {/* Vendors & Product Ticker */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-white font-bold">{activeVendorCount} Active Stores</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300">{totalSyncedProducts} Products</span>
              </div>

              {/* Connect Shopify Store CTA */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-bold text-xs hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Connect Shopify Store</span>
                <span className="sm:hidden">Connect</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Connect Store Modal */}
      <ConnectStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={onAddStore}
      />
    </>
  );
}

