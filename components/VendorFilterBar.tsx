"use client";

import React from "react";
import { Search, Store, Tag, ArrowUpDown, Layers, X } from "lucide-react";
import { MerchantVendor } from "@/data/mock-slots";

interface VendorFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  vendors: MerchantVendor[];
  selectedVendorId: string;
  onSelectVendor: (id: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categories: string[];
  totalResultsCount: number;
}

export function VendorFilterBar({
  searchQuery,
  onSearchChange,
  vendors,
  selectedVendorId,
  onSelectVendor,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  categories,
  totalResultsCount,
}: VendorFilterBarProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 z-20 relative">
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4 shadow-2xl">
        
        {/* Row 1: Prominent Product Search Bar & Category Pills */}
        <div className="space-y-3 pb-4 border-b border-white/10">
          
          {/* Dedicated Product Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              placeholder="Search product title, SKU, or tags (e.g. Carbon Fiber, Keyboard)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Product Category Pills & Product Count */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 mr-1 uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Categories:</span>
              </div>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all ${
                      isSelected
                        ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                        : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Product Count Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-bold">{totalResultsCount} Products</span>
            </div>
          </div>

        </div>

        {/* Row 2: Secondary Controls (Vendor Store & Sort Dropdowns) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Vendor Store Dropdown Filter */}
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-mono text-zinc-400 uppercase">Vendor Store:</span>
            <select
              value={selectedVendorId}
              onChange={(e) => onSelectVendor(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-3.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="all" className="bg-[#121216]">All Vendor Stores ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#121216]">
                  {v.name} ({v.myshopifyDomain})
                </option>
              ))}
            </select>
          </div>

          {/* Right: Sort Selector */}
          <div className="flex items-center gap-2 bg-black px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 uppercase text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
            >
              <option value="slot-asc" className="bg-[#121216]">Default Order</option>
              <option value="price-low" className="bg-[#121216]">Price: Low to High</option>
              <option value="price-high" className="bg-[#121216]">Price: High to Low</option>
              <option value="stock-high" className="bg-[#121216]">Stock: High Level</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
}
