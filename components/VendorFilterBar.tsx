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
      <div className="bauhaus-card p-5 bg-white space-y-6 sticky top-24">
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#111111]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#D62828]" />
            <h2 className="text-sm font-black text-[#111111] font-display uppercase tracking-wider">
              Filters & Search
            </h2>
          </div>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] font-mono text-[#D62828] font-bold hover:underline"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* 1. Quick Search Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#005F73]" />
            <span>Search Catalog</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search title, SKU, vendor..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#F4F4F0] border-2 border-[#111111] pl-9 pr-3 py-2 text-xs text-[#111111] placeholder-zinc-500 font-mono font-bold focus:outline-none focus:bg-white focus:border-[#FFB703] transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#111111]" />
          </div>
        </div>

        {/* 2. Category Dropdown Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#D62828]" />
            <span>Category Filter</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Vendor Store Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#005F73]" />
            <span>Approved Vendor Store</span>
          </label>
          <select
            value={selectedVendorId}
            onChange={(e) => onSelectVendor(e.target.value)}
            className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="all">All Active Stores ({vendors.length})</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.myshopifyDomain})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Sort Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Sort Order</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="slot-asc">Default Order</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="stock-high">Stock Level: High to Low</option>
          </select>
        </div>

        {/* Summary Footer */}
        <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between text-xs font-mono font-bold text-[#111111]">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#005F73]" />
            <span>Matching Items:</span>
          </div>
          <span className="text-[#111111] font-black bg-[#FFB703] px-2.5 py-0.5 border border-[#111111]">
            {totalResultsCount}
          </span>
        </div>

      </div>
    </aside>
  );
}


