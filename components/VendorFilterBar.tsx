"use client";

import React from "react";
import { Search, Store, Tag, ArrowUpDown, Layers, SlidersHorizontal, RotateCcw } from "lucide-react";
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
  const isFiltered =
    searchQuery !== "" ||
    selectedVendorId !== "all" ||
    selectedCategory !== "All Products" ||
    sortBy !== "slot-asc";

  const handleReset = () => {
    onSearchChange("");
    onSelectVendor("all");
    onSelectCategory("All Products");
    onSortChange("slot-asc");
  };

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-6 shadow-2xl sticky top-24">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Filters & Search
            </h2>
          </div>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] font-mono text-amber-400 hover:underline"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* 1. Quick Search Box */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>Search Catalog</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search title, SKU, vendor..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-black/80 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>

        {/* 2. Categories List */}
        <div className="space-y-2.5">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Categories</span>
          </label>
          <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-sans flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {isSelected && <span className="text-[10px] font-mono">●</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Vendor Store Filter */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>Vendor Store</span>
          </label>
          <select
            value={selectedVendorId}
            onChange={(e) => onSelectVendor(e.target.value)}
            className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="all" className="bg-[#121216]">All Stores ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id} className="bg-[#121216]">
                {v.name} ({v.myshopifyDomain})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Sort Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>Sort By</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="slot-asc" className="bg-[#121216]">Default Order</option>
            <option value="price-low" className="bg-[#121216]">Price: Low to High</option>
            <option value="price-high" className="bg-[#121216]">Price: High to Low</option>
            <option value="stock-high" className="bg-[#121216]">Stock: High Level</option>
          </select>
        </div>

        {/* Summary Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Matching Items:</span>
          </div>
          <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
            {totalResultsCount}
          </span>
        </div>
      </div>
    </aside>
  );
}

