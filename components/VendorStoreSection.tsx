"use client";

import React from "react";
import { Store, ShieldCheck, Activity, Layers, ExternalLink } from "lucide-react";
import { MerchantVendor, SlotListing } from "@/data/mock-slots";
import { ListingCard } from "@/components/ListingCard";

interface VendorStoreSectionProps {
  vendor: MerchantVendor;
  slots: SlotListing[];
  onSelectSlot: (slot: SlotListing) => void;
}

export function VendorStoreSection({ vendor, slots, onSelectSlot }: VendorStoreSectionProps) {
  if (slots.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Vendor Storefront Header Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 mb-6 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Vendor Logo & Domain Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {vendor.storeLogo ? (
              <img
                src={vendor.storeLogo}
                alt={vendor.name}
                className="w-12 h-12 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Store className="w-6 h-6" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090A0F]" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-extrabold text-white tracking-tight font-sans">
                {vendor.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                VERIFIED VENDOR
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs font-mono text-zinc-400">
              <span className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                {vendor.myshopifyDomain}
                <ExternalLink className="w-3 h-3" />
              </span>
              <span className="text-zinc-600">•</span>
              <span>Last Webhook: {vendor.lastWebhookSync}</span>
            </div>
          </div>
        </div>

        {/* Right: Catalog Count & Storefront API Status */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#090A0F] border border-white/10 text-xs font-mono flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">Catalog Slots:</span>
            <span className="text-white font-bold">{slots.length} Listed</span>
          </div>

          <div className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-bold items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Storefront API 2024.04</span>
          </div>
        </div>

      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => (
          <ListingCard key={slot.id} slot={slot} onSelect={onSelectSlot} />
        ))}
      </div>
    </section>
  );
}
