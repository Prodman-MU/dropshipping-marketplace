/**
 * @file page.tsx (under app/)
 * @description Modern Gallery-Grade Marketplace Homepage (Apple Store x MR PORTER x Grailed).
 * 
 * Features:
 * - Pure white canvas with generous spatial architecture
 * - Frosted glass navigation & Apple x MR PORTER hybrid hero
 * - Top control bar with category pill rail & slide-over filter drawer
 * - 4-column desktop / 2-column mobile zero-border product cards
 * - Curated vendor grouped view mode
 * - Minimalist Apple-style pagination & frosted modal dialogs
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { VendorFilterBar } from "@/components/VendorFilterBar";
import { ListingCard } from "@/components/ListingCard";
import { ListingDrawer } from "@/components/ListingDrawer";
import { StoreStatusModal } from "@/components/StoreStatusModal";
import { SlotListing, MerchantVendor } from "@/data/mock-slots";
import { PackageCheck, HelpCircle, ChevronLeft, ChevronRight, Store, LayoutGrid, Sparkles } from "lucide-react";
import { VendorGroupedSection } from "@/components/VendorGroupedSection";
import {
  getInitialMerchants,
  getInitialSlots,
  saveMerchants,
  saveSlots,
} from "@/lib/store-manager";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";

export default function MarketplaceHomePage() {
  const [merchants, setMerchants] = useState<MerchantVendor[]>([]);
  const [slots, setSlots] = useState<SlotListing[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState("slot-asc");

  const [selectedSlot, setSelectedSlot] = useState<SlotListing | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMissingStoreModalOpen, setIsMissingStoreModalOpen] = useState(false);

  // View Mode: 'vendor' or 'grid' (default: 'vendor')
  const [viewMode, setViewMode] = useState<"grid" | "vendor">("vendor");

  // Pagination state: 10, 20, or 50 items per page
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Sync state on mount and hydrate live database records from PostgreSQL
  useEffect(() => {
    setMerchants(getInitialMerchants());
    setSlots(getInitialSlots());
    setSiteSettings(getSiteSettings());

    const fetchLiveDbData = async () => {
      try {
        const [mRes, lRes] = await Promise.all([
          fetch("/api/merchants").then((r) => r.json()).catch(() => null),
          fetch("/api/listings").then((r) => r.json()).catch(() => null),
        ]);

        if (mRes?.merchants && Array.isArray(mRes.merchants) && mRes.merchants.length > 0) {
          const currentLocal = getInitialMerchants();
          const dbDomains = new Set(mRes.merchants.map((m: any) => m.myshopifyDomain));
          const localOnly = currentLocal.filter((m) => !dbDomains.has(m.myshopifyDomain));
          const mergedM = [...mRes.merchants, ...localOnly];
          setMerchants(mergedM);
          saveMerchants(mergedM);
        }

        if (lRes?.slots && Array.isArray(lRes.slots) && lRes.slots.length > 0) {
          const currentLocalSlots = getInitialSlots();
          const dbSlotIds = new Set(lRes.slots.map((s: any) => s.shopifyProductId || s.id));
          const localOnlySlots = currentLocalSlots.filter((s) => !dbSlotIds.has(s.shopifyProductId) && !dbSlotIds.has(s.id));
          const mergedS = [...lRes.slots, ...localOnlySlots];
          setSlots(mergedS);
          saveSlots(mergedS);
        }
      } catch (e) {
        console.warn("Failed to load live database records in catalog:", e);
      }
    };

    fetchLiveDbData();

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get("view");
      if (viewParam === "vendor" || viewParam === "grid") {
        setViewMode(viewParam);
      } else {
        const savedView = localStorage.getItem("catalog_view_mode");
        if (savedView === "vendor" || savedView === "grid") {
          setViewMode(savedView as "grid" | "vendor");
        } else {
          setViewMode("vendor");
        }
      }
    }

    const handleSettingsChange = () => setSiteSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isConnected = urlParams.get("connected");
      const domainParam = urlParams.get("domain");

      if (isConnected === "true" && domainParam) {
        handleAddStore(domainParam);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    const handleStateChange = () => {
      setMerchants(getInitialMerchants());
      setSlots(getInitialSlots());
    };

    window.addEventListener("store-state-changed", handleStateChange);
    return () => window.removeEventListener("store-state-changed", handleStateChange);
  }, []);

  // Extract unique product categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s) => set.add(s.category));
    return ["All Products", ...Array.from(set)];
  }, [slots]);

  // Active Merchants list & count
  const activeMerchants = useMemo(() => {
    return merchants.filter((m) => m.status === "ACTIVE");
  }, [merchants]);

  // Handler to connect and fetch real merchant products from Shopify Store
  const handleAddStore = async (domain: string, token?: string, whatsappNumber?: string, passcode?: string) => {
    const res = await fetch("/api/shopify/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, token, whatsappNumber, passcode }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Storefront Verification Failed: Could not reach or verify store.");
    }

    const { merchant, slots: newSlots } = data;

    const currentM = getInitialMerchants();
    const currentS = getInitialSlots();

    const filteredM = currentM.filter((m) => m.myshopifyDomain !== merchant.myshopifyDomain);
    const filteredS = currentS.filter((s) => s.merchant.myshopifyDomain !== merchant.myshopifyDomain);

    const updatedM = [merchant, ...filteredM];
    const updatedS = [...newSlots, ...filteredS];

    setMerchants(updatedM);
    setSlots(updatedS);
    saveMerchants(updatedM);
    saveSlots(updatedS);
  };

  // Filter & Sort Logic: ONLY SHOW SLOTS FROM "ACTIVE" MERCHANTS
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (slot.merchant.status !== "ACTIVE") {
        return false;
      }
      if (selectedVendorId !== "all" && slot.merchant.id !== selectedVendorId) {
        return false;
      }
      if (selectedCategory !== "All Products" && slot.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = slot.title.toLowerCase().includes(q);
        const matchesSKU = slot.sku.toLowerCase().includes(q);
        const matchesTags = slot.tags.some((t) => t.toLowerCase().includes(q));
        const matchesVendor = slot.merchant.myshopifyDomain.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSKU && !matchesTags && !matchesVendor) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      return a.slotNumber.localeCompare(b.slotNumber);
    });
  }, [slots, selectedVendorId, selectedCategory, searchQuery, sortBy]);

  const handleViewModeChange = (mode: "grid" | "vendor") => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("catalog_view_mode", mode);
      const url = new URL(window.location.href);
      url.searchParams.set("view", mode);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Group slots by Vendor when in "vendor" view mode
  const vendorGroups = useMemo(() => {
    const map = new Map<string, { merchant: MerchantVendor; slots: SlotListing[] }>();
    filteredSlots.forEach((slot) => {
      const vId = slot.merchant.id || slot.merchant.myshopifyDomain;
      if (!map.has(vId)) {
        map.set(vId, {
          merchant: slot.merchant,
          slots: [],
        });
      }
      map.get(vId)!.slots.push(slot);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.slots.length !== a.slots.length) {
        return b.slots.length - a.slots.length;
      }
      return (a.merchant.name || a.merchant.myshopifyDomain).localeCompare(
        b.merchant.name || b.merchant.myshopifyDomain
      );
    });
  }, [filteredSlots]);

  // Reset pagination to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedVendorId, selectedCategory, sortBy, pageSize]);

  // Paginated slots slice (for Grid View)
  const totalPages = Math.ceil(filteredSlots.length / pageSize) || 1;
  const paginatedSlots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSlots.slice(start, start + pageSize);
  }, [filteredSlots, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans">
      
      {/* Sticky Frosted Header */}
      <Header
        activeVendorCount={activeMerchants.length}
        totalSyncedProducts={filteredSlots.length}
        onOpenStoreStatus={() => setIsMissingStoreModalOpen(true)}
      />

      {/* Apple x MR PORTER Editorial Hero Carousel */}
      <Hero
        isVideoEnabled={isVideoEnabled}
        onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
      />

      {/* Main Catalog Container */}
      <main id="product-catalog" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20 space-y-8">
        
        {/* Section Headline & Metric Tag */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200/70 pb-6">
          <div className="space-y-1.5">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest block">
              VERIFIED SUPPLIER NETWORK // PAN-INDIA
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-neutral-950 font-normal leading-tight">
              Curated Catalog
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-normal max-w-2xl">
              Architectural merchandise and high-margin goods handpicked by Masters Union student entrepreneurs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-end shrink-0">
            {/* View Mode Toggle Switcher (Store View 1st, Grid View 2nd) */}
            <div className="flex items-center p-1 rounded-full bg-neutral-100 border border-neutral-200/80">
              <button
                type="button"
                onClick={() => handleViewModeChange("vendor")}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  viewMode === "vendor"
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-black"
                }`}
                title="Group by Store"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Stores</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-black shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-black"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

            <span className="font-mono text-xs font-medium text-neutral-500 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200/60 hidden sm:inline-block">
              {filteredSlots.length} Items
            </span>
          </div>
        </div>

        {/* Top Control Bar & Filter Drawer Integration */}
        <VendorFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          vendors={activeMerchants}
          selectedVendorId={selectedVendorId}
          onSelectVendor={setSelectedVendorId}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          categories={categories}
          totalResultsCount={filteredSlots.length}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {/* Catalog Content */}
        {filteredSlots.length > 0 ? (
          viewMode === "grid" ? (
            /* 4-Column Desktop / 2-Column Mobile Zero-Border Grid */
            <div className="space-y-12">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                {paginatedSlots.map((slot) => (
                  <div key={slot.id}>
                    <ListingCard
                      slot={slot}
                      onSelect={(s) => setSelectedSlot(s)}
                    />
                  </div>
                ))}
              </div>

              {/* Minimalist Apple-Style Pagination Bar */}
              {totalPages > 1 && (
                <div className="pt-8 border-t border-neutral-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-500">
                  <span>
                    Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredSlots.length)} of {filteredSlots.length} items
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="pill-btn-secondary px-3 py-1.5 text-xs font-mono disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1 inline" />
                      Prev
                    </button>

                    {/* Compact page indicator on mobile */}
                    <div className="flex sm:hidden items-center px-2 text-xs font-mono font-medium text-neutral-800">
                      Page {currentPage} of {totalPages}
                    </div>

                    {/* Full numbered buttons on sm: and up */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          type="button"
                          onClick={() => setCurrentPage(pg)}
                          className={`w-7 h-7 rounded-full text-xs font-mono transition cursor-pointer ${
                            currentPage === pg
                              ? "bg-black text-white font-semibold"
                              : "text-neutral-600 hover:bg-neutral-100"
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="pill-btn-secondary px-3 py-1.5 text-xs font-mono disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Curated Grouped by Vendor View */
            <div className="space-y-12 divide-y divide-neutral-200/70">
              {vendorGroups.map((group) => (
                <VendorGroupedSection
                  key={group.merchant.id || group.merchant.myshopifyDomain}
                  merchant={group.merchant}
                  slots={group.slots}
                  onSelectSlot={(s) => setSelectedSlot(s)}
                  onFilterStore={(vendorId) => {
                    setSelectedVendorId(vendorId);
                    const el = document.getElementById("product-catalog");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                />
              ))}
            </div>
          )
        ) : (
          /* Clean Minimalist Empty State */
          <div className="bg-[#F8F9FA] rounded-3xl border border-neutral-200/80 p-12 sm:p-16 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto text-neutral-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-editorial text-2xl text-neutral-950 font-normal">
              No Matching Products Found
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Try adjusting your category, search keywords, or store filter to explore the catalog.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedVendorId("all");
                  setSelectedCategory("All Products");
                }}
                className="pill-btn-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Reset All Filters
              </button>
              <button
                type="button"
                onClick={() => setIsMissingStoreModalOpen(true)}
                className="pill-btn-secondary px-5 py-2.5 text-xs font-medium uppercase tracking-wider cursor-pointer"
              >
                Check Store Status
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Gallery Minimalist Footer */}
      <footer className="bg-[#FAFAFA] border-t border-neutral-200/70 text-neutral-600 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
          
          <div className="space-y-3">
            <span className="font-semibold text-neutral-950 text-sm tracking-tight block">
              MASTERS UNION DROPSHIPPING
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              A gallery-grade dropshipping curation network empowering Masters Union student merchants to discover, verify, and launch high-margin inventory directly sourced from premier artisans and manufacturers.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-[11px] font-semibold text-neutral-950 uppercase tracking-wider block">
              Portals & Access
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/vendor" className="hover:text-black transition">
                  Vendor Portal Login →
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-black transition">
                  Admin Control Desk →
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-[11px] font-semibold text-neutral-950 uppercase tracking-wider block">
              Store Moderation
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              All merchant stores undergo verification to ensure high quality product data and authentic inventory sync.
            </p>
            <button
              type="button"
              onClick={() => setIsMissingStoreModalOpen(true)}
              className="text-xs font-medium text-black hover:underline cursor-pointer"
            >
              Check Store Status →
            </button>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-[11px] font-semibold text-neutral-950 uppercase tracking-wider block">
              Product Management Club
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed font-mono">
              Engineered by PMC at {siteSettings.siteTitle} // {siteSettings.dropshippingYear}
            </p>
          </div>

        </div>

        <div className="border-t border-neutral-200/60 py-6 text-center font-mono text-[11px] text-neutral-400">
          © {siteSettings.dropshippingYear} {siteSettings.siteTitle} // ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Quick View Drawer Modal */}
      <ListingDrawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onSelectRelatedSlot={(relSlot) => setSelectedSlot(relSlot)}
      />

      {/* Store Verification Status Modal */}
      <StoreStatusModal
        isOpen={isMissingStoreModalOpen}
        onClose={() => setIsMissingStoreModalOpen(false)}
        merchants={merchants}
        onAddStore={handleAddStore}
      />

    </div>
  );
}
