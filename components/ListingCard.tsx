"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Tag, Package, Store, Eye, ArrowUpRight } from "lucide-react";
import { SlotListing } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";

interface ListingCardProps {
  slot: SlotListing;
  onSelect: (slot: SlotListing) => void;
}

export function ListingCard({ slot, onSelect }: ListingCardProps) {
  const isAvailable = slot.status === "AVAILABLE";
  const isReserved = slot.status === "RESERVED";
  const isSold = slot.status === "SOLD";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSelect(slot)}
      className="group relative cursor-pointer glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      {/* Top Border Glow Accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Slot Number & Status Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 tracking-tight font-mono-glow">
              {slot.slotNumber}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[120px]">
              {slot.sku}
            </span>
          </div>

          {/* Dynamic Pill Badge */}
          <div>
            {isAvailable && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AVAILABLE
              </span>
            )}
            {isReserved && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                RESERVED
              </span>
            )}
            {isSold && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                SOLD OUT
              </span>
            )}
          </div>
        </div>

        {/* Product Image Container */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-[#090A0F] mb-4 border border-white/5">
          {slot.images && slot.images[0] ? (
            <img
              src={slot.images[0]}
              alt={slot.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
              No Image Preview
            </div>
          )}

          {/* Category overlay badge */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-[#090A0F]/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">
            {slot.category}
          </div>

          {/* Vendor domain overlay badge */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-2.5 py-1 rounded-md bg-[#090A0F]/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 truncate">
              <Store className="w-3 h-3 text-emerald-400 shrink-0" />
              {slot.merchant.myshopifyDomain}
            </span>
            <span className="text-emerald-400 font-bold">API ACTIVE</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-white tracking-tight line-clamp-2 mb-2 group-hover:text-emerald-300 transition-colors font-sans">
          {slot.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {slot.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Monospaced Financial & Inventory Grid */}
      <div className="pt-3 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2 mb-4 bg-[#090A0F]/70 p-3 rounded-xl border border-white/5">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Shopify Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white font-mono">
                {formatCurrency(slot.price)}
              </span>
              {slot.compareAtPrice && (
                <span className="text-xs font-mono text-zinc-500 line-through">
                  {formatCurrency(slot.compareAtPrice)}
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Stock Level</span>
            <div className="flex items-center gap-1 text-sm font-bold font-mono">
              <Package className="w-3.5 h-3.5 text-emerald-400" />
              <span className={slot.inventoryQuantity > 10 ? "text-emerald-400" : "text-amber-400"}>
                {slot.inventoryQuantity} Units
              </span>
            </div>
          </div>
        </div>

        {/* Inspect Slot Details CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(slot);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-400"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>INSPECT SLOT DETAILS</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </motion.div>
  );
}
