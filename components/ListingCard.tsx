"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, ArrowUpRight } from "lucide-react";
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
      className="group relative cursor-pointer glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between overflow-hidden shadow-xl"
    >
      {/* Top Border Glow Accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Product Image Container */}
        <div className="relative w-full h-56 rounded-xl overflow-hidden bg-black mb-4 border border-white/5">
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
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-white tracking-tight line-clamp-2 mb-4 group-hover:text-amber-300 transition-colors font-sans">
          {slot.title}
        </h3>
      </div>

      {/* Product Details Link / Action CTA */}
      <div className="pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(slot);
          }}
          className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-amber-500 text-zinc-300 hover:text-black border border-white/10 hover:border-amber-400 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:bg-amber-500 group-hover:text-black"
        >
          <Eye className="w-4 h-4" />
          <span>INSPECT PRODUCT DETAILS</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  );
}
