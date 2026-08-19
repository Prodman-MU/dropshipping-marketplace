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
import { PackageCheck, HelpCircle, ChevronLeft, ChevronRight, Store } from "lucide-react";
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

  // Pagination state: 10, 20, or 50 items per page
  const [pageSize, setPageSize] = useState<10 | 20 | 50>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Sync state on mount and on store-state-changed event
  useEffect(() => {
    setMerchants(getInitialMerchants());
    setSlots(getInitialSlots());
    setSiteSettings(getSiteSettings());

    const handleSettingsChange = () => setSiteSettings(getSiteSettings());
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => window.removeEventListener("site-settings-changed", handleSettingsChange);
  }, []);

  useEffect(() => {
    // Check for OAuth connected URL params (?connected=true&domain=...)
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

  // Extract unique product categories from all slots
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

    // Update merchant list (avoid duplicates)
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

  // Product-Centric Filter & Sort Logic: ONLY SHOW SLOTS FROM "ACTIVE" (APPROVED) STORES
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // REQUIRE APPROVED (ACTIVE) MERCHANT STATUS FOR PUBLIC DISPLAY
      if (slot.merchant.status !== "ACTIVE") {
        return false;
      }
      // Vendor filter
      if (selectedVendorId !== "all" && slot.merchant.id !== selectedVendorId) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "All Products" && slot.category !== selectedCategory) {
        return false;
      }
      // Search query (Title, SKU, Tags, Vendor)
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
      if (sortBy === "stock-high") return b.inventoryQuantity - a.inventoryQuantity;
      return a.slotNumber.localeCompare(b.slotNumber);
    });
  }, [slots, selectedVendorId, selectedCategory, searchQuery, sortBy]);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedVendorId, selectedCategory, sortBy, pageSize]);

  // Paginated slots slice
  const totalPages = Math.ceil(filteredSlots.length / pageSize) || 1;
  const paginatedSlots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSlots.slice(start, start + pageSize);
  }, [filteredSlots, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#111111] selection:bg-[#FFB703] selection:text-[#111111]">
      
      {/* Bauhaus Header */}
      <Header
        activeVendorCount={activeMerchants.length}
        totalSyncedProducts={filteredSlots.length}
      />

      {/* Hero Section containing Video Container */}
      <Hero
        isVideoEnabled={isVideoEnabled}
        onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
      />

      {/* Main Catalog Header Bar */}
      <div id="product-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#111111] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#005F73] font-mono text-xs font-black uppercase tracking-wider mb-1">
              <PackageCheck className="w-4 h-4 text-[#D62828]" />
              <span>STUDENT DISCOVERIES // PAN-INDIA SELECTION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111] font-display uppercase tracking-tight">
              Curated Products
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#2B2D42] mt-0.5">
              Unique high-demand items handpicked by Masters Union students, discovered and sourced from manufacturing hubs & artisans all over India.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-2 bg-[#111111] text-[#FFB703] border-2 border-[#111111] font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#111111]">
              {filteredSlots.length} Live Items
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Filters + Right Product Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Left Pane Filters */}
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
          />

          {/* Right Product Grid Area */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Top Pagination & Active View Indicator Bar */}
            <div className="bg-white border-2 border-[#111111] p-3 sm:p-4 shadow-[4px_4px_0px_#111111] flex flex-wrap items-center justify-between gap-3 font-mono text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#111111] text-[#FFB703] font-black uppercase text-[11px]">
                  {selectedCategory}
                </span>
                <span className="text-[#2B2D42] text-xs">
                  Showing {filteredSlots.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}–{Math.min(currentPage * pageSize, filteredSlots.length)} of {filteredSlots.length} Products
                </span>
              </div>

              {/* Page Status & Prev/Next Controls */}
              {filteredSlots.length > 0 && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[#111111] text-[11px] sm:text-xs">
                    Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 bg-[#E5E5E0] hover:bg-[#FFB703] border-2 border-[#111111] disabled:opacity-40 disabled:hover:bg-[#E5E5E0] transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 bg-[#E5E5E0] hover:bg-[#FFB703] border-2 border-[#111111] disabled:opacity-40 disabled:hover:bg-[#E5E5E0] transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Product Grid - 2 Columns on Mobile */}
            {paginatedSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
                {paginatedSlots.map((slot) => (
                  <ListingCard
                    key={slot.id}
                    slot={slot}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border-4 border-[#111111] p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto my-6 shadow-[8px_8px_0px_#111111]">
                <div className="w-16 h-16 bg-[#FFB703] border-2 border-[#111111] flex items-center justify-center mx-auto text-2xl font-black">
                  ⚡
                </div>
                <h3 className="text-xl font-black text-[#111111] font-display uppercase">
                  No Matching Approved Products
                </h3>
                <p className="text-xs font-semibold text-[#2B2D42] leading-relaxed">
                  No approved live products match your filter criteria. Newly connected Shopify stores require Admin Approval in the control panel below before products appear on the public catalog.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedVendorId("all");
                      setSelectedCategory("All Products");
                    }}
                    className="px-5 py-2.5 bg-[#FFB703] text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => setIsMissingStoreModalOpen(true)}
                    className="px-5 py-2.5 bg-[#111111] text-white border-2 border-[#111111] bauhaus-btn text-xs font-bold"
                  >
                    Check Store Approval Status
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Pagination Bar */}
            {totalPages > 1 && (
              <div className="bg-white border-2 border-[#111111] p-4 shadow-[4px_4px_0px_#111111] flex items-center justify-between gap-4 font-mono text-xs font-bold">
                <span className="text-[#2B2D42]">
                  Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredSlots.length)} of {filteredSlots.length} items
                </span>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`w-8 h-8 border-2 border-[#111111] font-black text-xs transition-all ${
                        currentPage === pg
                          ? "bg-[#D62828] text-white shadow-[2px_2px_0px_#111111]"
                          : "bg-[#F4F4F0] text-[#111111] hover:bg-[#FFB703]"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] text-white border-t-4 border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-display text-2xl font-black uppercase tracking-tight block mb-3 text-[#FFB703]">
              MASTERS UNION<span className="text-[#D62828]">.</span>
            </span>
            <p className="text-xs text-gray-300 leading-relaxed font-medium mb-4">
              A pan-India dropshipping curation network empowering Masters Union student entrepreneurs to discover, verify, and launch winning products sourced directly from premier manufacturing & artisanal hubs across India.
            </p>
            <div className="flex gap-2">
              <span className="w-4 h-4 bg-[#D62828] border border-white"></span>
              <span className="w-4 h-4 bg-[#005F73] border border-white"></span>
              <span className="w-4 h-4 bg-[#FFB703] border border-white"></span>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#FFB703] mb-3">// PORTAL LOGINS & ACCESS</h4>
            <p className="text-xs text-gray-300 mb-3 font-medium">Protected management portals for approved vendors & platform admins.</p>
            <div className="space-y-2 font-mono text-xs font-bold">
              <Link
                href="/vendor"
                className="w-full px-3 py-2 bg-[#FFB703] text-[#111111] border-2 border-white hover:bg-white flex items-center justify-between transition-colors uppercase"
              >
                <span>🔑 Vendor Portal Login</span>
                <span>→</span>
              </Link>
              <Link
                href="/admin"
                className="w-full px-3 py-2 bg-[#D62828] text-white border-2 border-white hover:bg-white hover:text-[#111111] flex items-center justify-between transition-colors uppercase"
              >
                <span>🛡️ Admin Desk Login</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#FFB703] mb-3">// VENDOR APPROVAL PROTOCOL</h4>
            <p className="text-xs text-gray-300 mb-3 font-medium">New stores are automatically set to pending status. Admin moderation enforces quality control.</p>
            <button
              onClick={() => setIsMissingStoreModalOpen(true)}
              className="w-full bg-[#005F73] text-white px-4 py-2 border-2 border-white font-mono font-bold text-xs uppercase hover:bg-white hover:text-[#111111] transition-colors"
            >
              CHECK STORE APPROVAL STATUS
            </button>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[#FFB703] mb-3">// PRODUCT MANAGEMENT CLUB</h4>
            <p className="text-xs text-gray-300 leading-relaxed font-mono">
              Designed & Engineered by the<br />
              <span className="text-[#FFB703] font-bold">Product Management Club</span><br />
              at {siteSettings.siteTitle} // {siteSettings.dropshippingYear}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 py-6 text-center font-mono text-[11px] text-gray-400">
          © {siteSettings.dropshippingYear} {siteSettings.siteTitle} // BUILT BY THE PRODUCT MANAGEMENT CLUB. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Slide-out Product Detail Drawer */}
      <ListingDrawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onSelectRelatedSlot={(relSlot) => setSelectedSlot(relSlot)}
      />

      {/* "Your Store Missing?" Modal Popup */}
      <StoreStatusModal
        isOpen={isMissingStoreModalOpen}
        onClose={() => setIsMissingStoreModalOpen(false)}
        merchants={merchants}
        onAddStore={handleAddStore}
      />

    </div>
  );
}




