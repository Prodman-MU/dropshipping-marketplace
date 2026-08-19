"use client";

import React, { useState } from "react";
import { ExternalLink, Filter, ChevronDown, ChevronUp, Store } from "lucide-react";
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

  // Normalize store URL
  const storeUrl = merchant.myshopifyDomain.startsWith("http")
    ? merchant.myshopifyDomain
    : `https://${merchant.myshopifyDomain}`;

  // When collapsed, we only render up to 3 items (items 0 & 1 on mobile, 0, 1 & 2 on lg desktop)
  const displayedSlots = isExpanded ? slots : slots.slice(0, 3);
  const hasMoreThan3 = slots.length > 3;
  const hasMoreThan2 = slots.length > 2;

  return (
    <section className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111] p-4 sm:p-6 space-y-5">
      {/* Streamlined Horizontal Vendor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b-2 border-[#111111]">
        {/* Left Side: Store Logo + Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[#F4F4F0] border-2 border-[#111111] flex items-center justify-center shrink-0 overflow-hidden shadow-[2px_2px_0px_#111111]">
            {merchant.storeLogo ? (
              <img
                src={merchant.storeLogo}
                alt={merchant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-6 h-6 text-[#005F73]" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-[#111111] font-display uppercase tracking-tight truncate">
              {merchant.name || merchant.myshopifyDomain}
            </h3>

            <p className="text-[11px] font-mono text-zinc-500 font-bold truncate">
              {merchant.myshopifyDomain}
            </p>
          </div>
        </div>

        {/* Right Side: External Store Link + Filter Store Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          {/* External Storefront Link */}
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#F4F4F0] hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#111111] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            title={`Open ${merchant.myshopifyDomain} in new tab`}
          >
            <span>Visit Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Filter This Store Button */}
          <button
            onClick={() => onFilterStore(merchant.id)}
            className="px-3 py-1.5 bg-[#111111] hover:bg-[#D62828] text-white border-2 border-[#111111] font-mono text-xs font-black flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#111111] hover:translate-x-[-1px] hover:translate-y-[-1px]"
            title="Filter catalog to only show products from this store"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Store</span>
          </button>
        </div>
      </div>

      {/* Nested Product Grid - 1 Row (2 on mobile, 3 on desktop) when collapsed */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
        {displayedSlots.map((slot, index) => {
          // If collapsed, hide the 3rd item on mobile (< lg) so mobile stays strictly 1 row (2 columns)
          const isThirdItem = !isExpanded && index === 2;
          return (
            <div
              key={slot.id}
              className={isThirdItem ? "hidden lg:block" : "block"}
            >
              <ListingCard
                slot={slot}
                onSelect={onSelectSlot}
              />
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse Toggle if more items exist beyond 1 row */}
      {(hasMoreThan3 || hasMoreThan2) && (
        <div className={`pt-2 text-center ${!hasMoreThan3 && hasMoreThan2 && !isExpanded ? "block lg:hidden" : "block"}`}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4F4F0] hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] font-mono text-xs font-black uppercase transition-all shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px]"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Show 1 Row Only</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Show All {slots.length} Products from {merchant.name || "this store"}</span>
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
