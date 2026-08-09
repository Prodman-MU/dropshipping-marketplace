"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, ArrowUpRight, Store } from "lucide-react";
import { SlotListing } from "@/data/mock-slots";

interface ListingCardProps {
  slot: SlotListing;
  onSelect: (slot: SlotListing) => void;
}

export function ListingCard({ slot, onSelect }: ListingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onSelect(slot)}
      className="group relative cursor-pointer bg-zinc-950/95 rounded-2xl p-5 border border-zinc-800 hover:border-black/50 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl transition-all"
    >
      {/* Top Border Glow Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Product Image Container */}
        <div className="relative w-full h-52 rounded-xl overflow-hidden bg-black mb-4 border border-zinc-800/80">
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

          {/* Vendor Domain Badge on Image */}
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-amber-400 flex items-center gap-1">
            <Store className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[120px]">{slot.merchant.myshopifyDomain}</span>
          </div>

          {/* Price Tag Badge */}
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs font-mono shadow-md">
            ${slot.price.toFixed(2)}
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-white tracking-tight line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors font-sans">
          {slot.title}
        </h3>

        {/* Product Category & SKU */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-4">
          <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{slot.category}</span>
          <span className="text-zinc-500">{slot.sku}</span>
        </div>
      </div>

      {/* Product Details Link / Action CTA */}
      <div className="pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(slot);
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-amber-500 text-zinc-300 hover:text-black border border-white/10 hover:border-amber-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:bg-amber-500 group-hover:text-black"
        >
          <Eye className="w-4 h-4" />
          <span>INSPECT DETAILS</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  );
}

