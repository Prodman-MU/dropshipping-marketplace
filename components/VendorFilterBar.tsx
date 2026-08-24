/**
 * @file VendorFilterBar.tsx
 * @description Modern Top Filter Control Bar & Slide-Over Filter Drawer (Apple x MR PORTER x Grailed).
 * 
 * Features:
 * - Horizontal scrollable category pill rail with active state indicator
 * - Rounded pill search bar with clear button
 * - Sort dropdown selector
 * - Slide-over minimalist filter drawer with accordions, store selector, and matte black actions
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, RotateCcw, X, Check, ShieldCheck, ArrowUpDown, Store, Tag } from "lucide-react";
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
  viewMode?: "grid" | "vendor";
  onViewModeChange?: (mode: "grid" | "vendor") => void;
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
  viewMode = "grid",
  onViewModeChange,
}: VendorFilterBarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const activeFiltersCount =
    (selectedVendorId !== "all" ? 1 : 0) +
    (selectedCategory !== "All Products" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (sortBy !== "slot-asc" ? 1 : 0);

  const handleReset = () => {
    onSearchChange("");
    onSelectVendor("all");
    onSelectCategory("All Products");
    onSortChange("slot-asc");
  };

  return (
    <div className="w-full space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP CONTROL BAR: SEARCH, PILLS, SORT & FILTER TRIGGER       */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
        {/* Horizontal Category Pill Rail */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth shrink min-w-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100/80 text-neutral-700 hover:bg-neutral-200/70 hover:text-black"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right Action Island: Search, Filter Trigger, Sort Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto w-full md:w-auto justify-between md:justify-end">
          {/* Quick Pill Search Input */}
          <div className="relative w-full md:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-neutral-100/90 border border-transparent hover:border-neutral-300 focus:border-black focus:bg-white text-xs text-neutral-900 placeholder:text-neutral-400 font-normal focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className={`pill-btn-secondary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeFiltersCount > 0 ? "border-black text-black font-semibold" : ""
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-mono">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SLIDE-OVER FILTER DRAWER (Apple / Grailed Minimalist Sheet) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-over Drawer Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-neutral-950">Filters & Sort</h2>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-mono text-[11px]">
                      {activeFiltersCount} active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-neutral-500 hover:text-black font-medium transition"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* 1. Sort Order Section */}
                <div className="space-y-2.5">
                  <label className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Sort By
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: "slot-asc", label: "Featured / Default" },
                      { id: "price-low", label: "Price: Low to High" },
                      { id: "price-high", label: "Price: High to Low" },
                      { id: "title-asc", label: "Alphabetical (A–Z)" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSortChange(opt.id)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition ${
                          sortBy === opt.id
                            ? "bg-neutral-900 text-white font-semibold"
                            : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {sortBy === opt.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Category Section */}
                <div className="space-y-2.5">
                  <label className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Category ({categories.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => onSelectCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                            isSelected
                              ? "bg-black text-white"
                              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Merchant Store / Vendor Filter */}
                <div className="space-y-2.5">
                  <label className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Verified Merchant Stores ({vendors.length})
                  </label>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => onSelectVendor("all")}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs flex items-center justify-between transition ${
                        selectedVendorId === "all"
                          ? "bg-neutral-900 text-white font-semibold"
                          : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5" />
                        <span>All Active Stores ({vendors.length})</span>
                      </div>
                      {selectedVendorId === "all" && <Check className="w-3.5 h-3.5" />}
                    </button>

                    {vendors.map((v) => {
                      const isSelected = selectedVendorId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => onSelectVendor(v.id)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs flex items-center justify-between transition ${
                            isSelected
                              ? "bg-neutral-900 text-white font-semibold"
                              : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                            <div className="truncate">
                              <span className="font-medium">{v.name}</span>
                              <span className={`block font-mono text-[10px] truncate ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                                {v.myshopifyDomain}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Products Per Page */}
                <div className="space-y-2.5">
                  <label className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Products Per Page
                  </label>
                  <div className="flex items-center gap-2">
                    {[10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => onPageSizeChange(num as 10 | 20 | 50)}
                        className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium transition ${
                          pageSize === num
                            ? "bg-black text-white"
                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Sticky Bottom Footer */}
              <div className="p-6 border-t border-neutral-100 bg-white">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="pill-btn-primary w-full py-3 text-xs font-semibold tracking-wider uppercase"
                >
                  Show {totalResultsCount} Curated Results
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
