"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, ArrowUpRight } from "lucide-react";
import { SlotListing } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";

interface ListingCardProps {
  slot: SlotListing;
  onSelect: (slot: SlotListing) => void;
}

export function ListingCard({ slot, onSelect }: ListingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3, x: -3 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onClick={() => onSelect(slot)}
      className="group relative cursor-pointer bauhaus-card p-4 bg-white flex flex-col justify-between overflow-hidden"
    >
      <div className="space-y-3">
        {/* Product Image */}
        <div className="relative w-full h-56 bg-[#F4F4F0] border-2 border-[#111111] overflow-hidden">
          {slot.images && slot.images[0] ? (
            <img
              src={slot.images[0]}
              alt={slot.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#111111] font-mono text-xs font-bold">
              NO IMAGE PREVIEW
            </div>
          )}
        </div>

        {/* Price Below Image */}
        <div className="inline-block px-3 py-1 bg-[#FFB703] text-[#111111] border-2 border-[#111111] font-black text-sm font-mono shadow-[2px_2px_0px_#111111]">
          {formatCurrency(slot.price, slot.currencyCode || "INR")}
        </div>

        {/* Product Name */}
        <h3 className="text-base font-black text-[#111111] uppercase tracking-tight line-clamp-2 group-hover:text-[#D62828] transition-colors font-display">
          {slot.title}
        </h3>
      </div>

      {/* Button to see the product */}
      <div className="pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(slot);
          }}
          className="w-full py-2.5 px-4 bg-[#111111] hover:bg-[#D62828] text-white bauhaus-btn text-xs font-mono font-black flex items-center justify-center gap-2 transition-all"
        >
          <Eye className="w-4 h-4 text-[#FFB703]" />
          <span>VIEW PRODUCT</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  );
}


