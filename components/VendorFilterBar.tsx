"use client";

import React, { useState } from "react";
import { Search, Store, Tag, ArrowUpDown, Layers, SlidersHorizontal, RotateCcw, X, Filter } from "lucide-react";
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
  pageSize: 10 | 20 | 50;
  onPageSizeChange: (size: 10 | 20 | 50) => void;
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
  pageSize,
  onPageSizeChange,
  categories,
  totalResultsCount,
}: VendorFilterBarProps) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

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
    <>
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP SIDEBAR FILTER (hidden on mobile, visible lg:block)  */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
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
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>

          {/* 5. Items Per Page Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#005F73]" />
              <span>Products Per Page</span>
            </label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value) as 10 | 20 | 50)}
              className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white cursor-pointer"
            >
              <option value={10}>10 Products / Page</option>
              <option value={20}>20 Products / Page</option>
              <option value={50}>50 Products / Page</option>
            </select>
          </div>

          {/* Summary Footer */}
          <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between text-xs font-mono font-bold text-[#111111]">
            <div className="flex items-center gap-1.5">
              <span>Matching Items:</span>
            </div>
            <span className="text-[#111111] font-black bg-[#FFB703] px-2.5 py-0.5 border border-[#111111]">
              {totalResultsCount}
            </span>
          </div>

        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE STICKY BOTTOM FILTER BAR (visible lg:hidden)           */}
      {/* ------------------------------------------------------------- */}
      <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-4 border-[#111111] shadow-[0px_-6px_20px_rgba(0,0,0,0.15)] p-2.5 space-y-2">
        
        {/* Row 1: Horizontal Scrollable Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1 text-[11px] font-mono font-black shrink-0 border-2 border-[#111111] transition-all ${
                  isActive
                    ? "bg-[#FFB703] text-[#111111] shadow-[2px_2px_0px_#111111]"
                    : "bg-[#F4F4F0] text-[#111111] hover:bg-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Row 2: Search Input + Advanced Filter Sheet Trigger */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#F4F4F0] border-2 border-[#111111] pl-8 pr-2 py-1.5 text-xs text-[#111111] placeholder-zinc-500 font-mono font-bold focus:outline-none focus:bg-white"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#111111]" />
          </div>

          <button
            onClick={() => setIsMobileSheetOpen(true)}
            className={`px-3 py-1.5 border-2 border-[#111111] font-mono font-black text-xs flex items-center gap-1.5 shrink-0 transition-all ${
              isFiltered
                ? "bg-[#D62828] text-white shadow-[2px_2px_0px_#111111]"
                : "bg-[#FFB703] text-[#111111] shadow-[2px_2px_0px_#111111]"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters ({totalResultsCount})</span>
          </button>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE SLIDE-UP FILTER SHEET DRAWER                           */}
      {/* ------------------------------------------------------------- */}
      {isMobileSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-xs lg:hidden">
          <div className="bg-white border-t-4 border-x-4 border-[#111111] p-5 space-y-5 rounded-t-2xl shadow-[0px_-10px_25px_rgba(0,0,0,0.3)] max-h-[85vh] overflow-y-auto animate-slideUp">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D62828]" />
                <h3 className="text-base font-black text-[#111111] font-display uppercase">
                  Mobile Filter Options
                </h3>
              </div>
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="p-1 bg-[#F4F4F0] border-2 border-[#111111] hover:bg-[#D62828] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Vendor Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#005F73]" />
                <span>Vendor Store</span>
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => onSelectVendor(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111]"
              >
                <option value="all">All Active Stores ({vendors.length})</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.myshopifyDomain})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>Sort Order</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111]"
              >
                <option value="slot-asc">Default Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title-asc">Title: A to Z</option>
              </select>
            </div>

            {/* Products Per Page */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#005F73]" />
                <span>Products Per Page</span>
              </label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value) as 10 | 20 | 50)}
                className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111]"
              >
                <option value={10}>10 Products / Page</option>
                <option value={20}>20 Products / Page</option>
                <option value={50}>50 Products / Page</option>
              </select>
            </div>

            {/* Reset & Apply Actions */}
            <div className="pt-3 border-t-2 border-[#111111] flex items-center gap-3">
              {isFiltered && (
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-[#F4F4F0] text-[#D62828] border-2 border-[#111111] font-mono font-black text-xs uppercase"
                >
                  Reset All
                </button>
              )}
              <button
                onClick={() => setIsMobileSheetOpen(false)}
                className="flex-1 py-2.5 bg-[#111111] text-white border-2 border-[#111111] font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#FFB703]"
              >
                Apply Filters ({totalResultsCount})
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
