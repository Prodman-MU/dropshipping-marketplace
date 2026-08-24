/**
 * @file ListingCard.tsx
 * @description Modern Zero-Border Product Card (Grailed x Apple Store).
 * 
 * Features:
 * - Pure zero-border container on clean white canvas
 * - Studio neutral image backdrop (`#F5F5F7`) with smooth scale & secondary image preview on hover
 * - Grailed micro-data typography for brand/vendor tags (11px JetBrains Mono)
 * - Clean mid-weight Inter sans title & uncluttered price formatting
 * - Minimalist status pill badges (1px hairline border)
 * - Slide-up matte black "Quick View" pill action on hover
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ArrowUpRight, ShieldCheck } from "lucide-react";
import { SlotListing } from "@/data/mock-slots";
import { formatCurrency, getProductPageUrl } from "@/lib/utils";

interface ListingCardProps {
  slot: SlotListing;
  onSelect?: (slot: SlotListing) => void;
}

export function ListingCard({ slot, onSelect }: ListingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isOutOfStock =
    (!slot.isUnknownQuantity && slot.inventoryQuantity <= 0) ||
    slot.status === "SOLD";

  const primaryImage = slot.images && slot.images[0] ? slot.images[0] : null;
  const secondaryImage = slot.images && slot.images[1] ? slot.images[1] : primaryImage;

  const discountPercent =
    slot.compareAtPrice && slot.compareAtPrice > slot.price
      ? Math.round(((slot.compareAtPrice - slot.price) / slot.compareAtPrice) * 100)
      : 0;

  return (
    <div 
      className="group relative flex flex-col justify-between h-full cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={getProductPageUrl(slot)} className="block flex-1 flex flex-col">
        
        {/* Product Image Frame with Studio Backdrop */}
        <div className="relative w-full aspect-square sm:aspect-[4/5] bg-[#F5F5F7] rounded-xl sm:rounded-2xl overflow-hidden mb-3">
          {primaryImage ? (
            <>
              <img
                src={isHovered && secondaryImage ? secondaryImage : primaryImage}
                alt={slot.title}
                className="w-full h-full object-cover object-center group-hover:scale-104 transition-all duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-mono text-xs">
              NO PREVIEW
            </div>
          )}

          {/* Minimalist Top Status & Discount Badges */}
          <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
            <div>
              {isOutOfStock ? (
                <span className="px-2 py-0.5 rounded-full bg-neutral-900 text-white font-mono text-[9px] font-semibold uppercase tracking-wider">
                  SOLD OUT
                </span>
              ) : slot.compareAtPrice && slot.compareAtPrice > slot.price ? (
                <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs border border-neutral-200/80 text-neutral-900 font-mono text-[9px] font-semibold uppercase tracking-wider shadow-2xs">
                  CURATED DROP
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs border border-neutral-200/80 text-neutral-700 font-mono text-[9px] font-semibold uppercase tracking-wider shadow-2xs">
                  ARCHIVE
                </span>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-semibold uppercase tracking-wider shadow-xs">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Slide-Up Quick View Pill Action on Desktop Hover */}
          <div className="absolute bottom-3 inset-x-3 z-10 hidden sm:flex justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSelect) onSelect(slot);
              }}
              className="pill-btn-primary w-full py-2.5 text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 shadow-md hover:bg-neutral-800"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Details (Grailed Minimalist Structure) */}
        <div className="space-y-1 px-0.5 flex-1 flex flex-col">
          {/* Brand / Vendor Micro-Data */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider line-clamp-1">
              {slot.merchant.name || slot.merchant.myshopifyDomain.replace(".myshopify.com", "")}
            </span>

            {slot.category && slot.category !== "All Products" && (
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest hidden sm:inline-block">
                {slot.category}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="text-sm sm:text-[15px] font-medium text-neutral-900 leading-snug line-clamp-2 group-hover:text-black transition-colors pt-0.5">
            {slot.title}
          </h3>

          {/* Clean Price Line with Discount % */}
          <div className="mt-auto pt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-sm sm:text-base text-neutral-950">
              {formatCurrency(slot.price, slot.currencyCode || "INR")}
            </span>

            {slot.compareAtPrice && slot.compareAtPrice > slot.price && (
              <span className="text-xs text-neutral-400 line-through font-normal">
                {formatCurrency(slot.compareAtPrice, slot.currencyCode || "INR")}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="font-mono text-[11px] font-semibold text-emerald-600">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

      </Link>
    </div>
  );
}
