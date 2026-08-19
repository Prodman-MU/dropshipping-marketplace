/**
 * @file ListingCard.tsx
 * @description Bauhaus Product Card Component for Catalog Grids.
 * 
 * Renders a tactile Bauhaus-styled product card with responsive 2-column mobile layout,
 * image viewport, wholesale price badge, MSRP discount strike-through, out-of-stock tag,
 * fixed-height title container for horizontal store baseline alignment, and fulfilling merchant badge.
 */

"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ArrowUpRight, ShieldCheck } from "lucide-react";
import { SlotListing } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";

/**
 * Props for the ListingCard component
 */
interface ListingCardProps {
  /** The catalog slot data containing pricing, images, variants, and merchant details */
  slot: SlotListing;
  /** Optional click callback */
  onSelect?: (slot: SlotListing) => void;
}

/**
 * Product Card Component with smooth hover elevations and Bauhaus borders.
 */
export function ListingCard({ slot, onSelect }: ListingCardProps) {
  // Determine if product is out of stock without exposing numerical counts
  const isOutOfStock =
    (!slot.isUnknownQuantity && slot.inventoryQuantity <= 0) ||
    slot.status === "SOLD";

  return (
    <Link href={`/product/${slot.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -3, x: -3 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={() => onSelect && onSelect(slot)}
        className="group relative cursor-pointer bauhaus-card p-2.5 sm:p-4 bg-white flex flex-col justify-between overflow-hidden h-full"
      >
        <div className="space-y-2.5 flex-1 flex flex-col">
          {/* Product Image Box */}
          <div className="relative w-full h-36 sm:h-48 md:h-56 bg-[#F4F4F0] border-2 border-[#111111] overflow-hidden shrink-0">
            {slot.images && slot.images[0] ? (
              <img
                src={slot.images[0]}
                alt={slot.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#111111] font-mono text-[10px] font-bold">
                NO PREVIEW
              </div>
            )}
          </div>

          {/* Price & Out of Stock Status Line */}
          <div className="flex items-center justify-between gap-1 flex-wrap shrink-0">
            <div className="flex items-center gap-2">
              <div className="inline-block px-2.5 py-1 bg-[#FFB703] text-[#111111] border-2 border-[#111111] font-black text-xs sm:text-sm font-mono shadow-[2px_2px_0px_#111111]">
                {formatCurrency(slot.price, slot.currencyCode || "INR")}
              </div>

              {slot.compareAtPrice && slot.compareAtPrice > slot.price && (
                <span className="text-[10px] sm:text-xs font-mono text-zinc-500 line-through font-bold">
                  {formatCurrency(slot.compareAtPrice, slot.currencyCode || "INR")}
                </span>
              )}
            </div>

            {/* High-contrast OUT OF STOCK tag (shown only if unavailable) */}
            {isOutOfStock && (
              <span className="px-1.5 py-0.5 bg-[#D62828] text-white font-mono font-black text-[9px] border border-[#111111]">
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Product Title Container with fixed height so store names align across rows */}
          <div className="h-8 sm:h-12 flex items-start overflow-hidden">
            <h3 className="text-xs sm:text-base font-black text-[#111111] uppercase tracking-tight line-clamp-2 group-hover:text-[#D62828] transition-colors font-display leading-tight sm:leading-snug">
              {slot.title}
            </h3>
          </div>

          {/* Merchant Vendor Name (consistently aligned) */}
          <div className="mt-auto pt-1 flex items-center gap-1.5 font-mono text-[10px] text-[#005F73] font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="line-clamp-1">{slot.merchant.name}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 shrink-0">
          <div className="w-full py-2 px-3 bg-[#111111] group-hover:bg-[#D62828] text-white bauhaus-btn text-[10px] sm:text-xs font-mono font-black flex items-center justify-center gap-1.5 transition-all">
            <Eye className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>VIEW PRODUCT</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
