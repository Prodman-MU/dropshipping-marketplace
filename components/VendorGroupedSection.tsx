/**
 * @file VendorGroupedSection.tsx
 * @description Modern Editorial Store Section (MR PORTER x Apple Store).
 * 
 * Features:
 * - Curated store brand header with verified badge and micro-data domain
 * - Seamless zero-border product card grid
 * - Responsive 4-col / 2-col layout with minimalist expand/collapse controls
 */

"use client";

import React, { useState } from "react";
import { ExternalLink, Filter, ChevronDown, ChevronUp, Store, ShieldCheck } from "lucide-react";
import { MerchantVendor, SlotListing } from "@/data/mock-slots";
import { ListingCard } from "./ListingCard";

interface VendorGroupedSectionProps {
  merchant: MerchantVendor;
  slots: SlotListing[];
  onSelectSlot?: (slot: SlotListing) => void;
  onFilterStore: (vendorId: string) => void;
}

export function VendorGroupedSection({
  merchant,
  slots,
  onSelectSlot,
  onFilterStore,
}: VendorGroupedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const storeUrl = merchant.myshopifyDomain.startsWith("http")
    ? merchant.myshopifyDomain
    : `https://${merchant.myshopifyDomain}`;

  // When collapsed, show up to 4 items on desktop (2 on mobile)
  const displayedSlots = isExpanded ? slots : slots.slice(0, 4);
  const hasMoreThan4 = slots.length > 4;

  return (
    <section className="bg-white border-b border-neutral-200/70 pb-10 pt-4 space-y-6">
      {/* Editorial Store Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Store Monogram / Logo + Store Name */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden text-neutral-800">
            {merchant.storeLogo ? (
              <img
                src={merchant.storeLogo}
                alt={merchant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-semibold text-xs font-mono uppercase">
                {(merchant.name || "ST").slice(0, 2)}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-neutral-950 truncate tracking-tight">
                {merchant.name || merchant.myshopifyDomain}
              </h3>
              <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
            </div>

            <p className="font-mono text-[11px] text-neutral-500 font-medium truncate">
              {merchant.myshopifyDomain} • {slots.length} Curated Item{slots.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {/* Right Side: Action Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn-secondary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
            title={`Open ${merchant.myshopifyDomain} in new tab`}
          >
            <span>Visit Storefront</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>

          <button
            type="button"
            onClick={() => onFilterStore(merchant.id)}
            className="pill-btn-primary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="Filter catalog to only show products from this store"
          >
            <Filter className="w-3 h-3" />
            <span>Filter Store</span>
          </button>
        </div>
      </div>

      {/* Zero-Border Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
        {displayedSlots.map((slot) => (
          <div key={slot.id}>
            <ListingCard slot={slot} onSelect={onSelectSlot} />
          </div>
        ))}
      </div>

      {/* Expand / Collapse Control */}
      {hasMoreThan4 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="pill-btn-secondary px-5 py-2 text-xs font-medium tracking-wide flex items-center gap-2 mx-auto cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Show All {slots.length} Products from {merchant.name || "this store"}</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
