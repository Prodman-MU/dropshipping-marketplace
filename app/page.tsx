"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { VendorFilterBar } from "@/components/VendorFilterBar";
import { ListingCard } from "@/components/ListingCard";
import { ListingDrawer } from "@/components/ListingDrawer";
import { SlotListing, MerchantVendor } from "@/data/mock-slots";
import { PackageCheck } from "lucide-react";
import {
  getInitialMerchants,
  getInitialSlots,
  saveMerchants,
  saveSlots,
} from "@/lib/store-manager";

export default function MarketplaceHomePage() {
  const [merchants, setMerchants] = useState<MerchantVendor[]>([]);
  const [slots, setSlots] = useState<SlotListing[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState("slot-asc");

  const [selectedSlot, setSelectedSlot] = useState<SlotListing | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Sync state on mount and on store-state-changed event
  useEffect(() => {
    setMerchants(getInitialMerchants());
    setSlots(getInitialSlots());

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

  // Handler to add new merchant store dynamically (starts as PENDING approval)
  const handleAddStore = (domain: string) => {
    const newId = `m-${Date.now()}`;
    const newName = domain.split(".")[0].toUpperCase().replace("-", " ");
    const newMerchant: MerchantVendor = {
      id: newId,
      name: newName,
      myshopifyDomain: domain,
      storeLogo: "https://images.unsplash.com/photo-1556742049-0a67daf40974?w=150&auto=format&fit=crop&q=80",
      status: "ACTIVE",
      totalProducts: 2,
      connectedSince: "Just Now",
      lastWebhookSync: "Just Now",
    };

    const newSlot1: SlotListing = {
      id: `slot-${Date.now()}-1`,
      slotNumber: `SLOT #${String(slots.length + 1).padStart(3, "0")}`,
      title: `${newName} Tactical Smart Charger Asset`,
      description: "Directly fetched product asset, photos, and specs from newly connected Shopify Storefront.",
      category: "Tactical Tech & EDC",
      price: 129.00,
      inventoryQuantity: 50,
      status: "AVAILABLE",
      shopifyProductId: `gid://shopify/Product/${Date.now()}1`,
      shopifyVariantId: `gid://shopify/ProductVariant/${Date.now()}1`,
      merchant: newMerchant,
      tags: ["New Sync", "Shopify API"],
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"],
      sku: "NEW-SYNC-01",
      createdAt: new Date().toISOString(),
      variants: [
        { id: `v-${Date.now()}`, title: "Default Variant", price: 129.00, sku: "NEW-SYNC-01", inventoryQuantity: 50, availableForSale: true }
      ],
      syncLogs: [
        { id: `log-${Date.now()}`, eventType: "products/create", status: "SUCCESS", timestamp: new Date().toLocaleTimeString(), details: "Storefront linked & items fetched. Published live on marketplace." }
      ]
    };

    const newSlot2: SlotListing = {
      id: `slot-${Date.now()}-2`,
      slotNumber: `SLOT #${String(slots.length + 2).padStart(3, "0")}`,
      title: `${newName} Pro Wireless Comm Dock`,
      description: "Hi-Fi wireless communication dock with magnetic charging contacts and anodized aluminum chassis.",
      category: "Audiophile Hardware",
      price: 219.00,
      inventoryQuantity: 25,
      status: "AVAILABLE",
      shopifyProductId: `gid://shopify/Product/${Date.now()}2`,
      shopifyVariantId: `gid://shopify/ProductVariant/${Date.now()}2`,
      merchant: newMerchant,
      tags: ["Wireless Dock", "Audiophile"],
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
      sku: "NEW-SYNC-02",
      createdAt: new Date().toISOString(),
      variants: [
        { id: `v-${Date.now()}-2`, title: "Stealth Gray", price: 219.00, sku: "NEW-SYNC-02", inventoryQuantity: 25, availableForSale: true }
      ],
      syncLogs: [
        { id: `log-${Date.now()}-2`, eventType: "products/create", status: "SUCCESS", timestamp: new Date().toLocaleTimeString(), details: "Storefront linked & items fetched. Published live on marketplace." }
      ]
    };

    const updatedM = [newMerchant, ...merchants];
    const updatedS = [newSlot1, newSlot2, ...slots];
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

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-amber-500 selection:text-black">
      
      {/* Glassmorphic Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeVendorCount={activeMerchants.length}
        totalSyncedProducts={filteredSlots.length}
        isVideoEnabled={isVideoEnabled}
        onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
        onAddStore={handleAddStore}
      />

      {/* Hero Section containing Video Container */}
      <Hero
        isVideoEnabled={isVideoEnabled}
        onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
        activeVendorCount={activeMerchants.length}
        totalSyncedProducts={filteredSlots.length}
      />

      {/* Text Block below Video Hero section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold tracking-widest uppercase mb-1">
              <PackageCheck className="w-4 h-4" />
              <span>LIVE MARKETPLACE CATALOG</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-sans uppercase tracking-tight">
              Dropshipped Products
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-1">
              Verified inventory & real-time webhook synchronized products from active Shopify storefronts.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-full font-bold">
              {filteredSlots.length} Products Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Filters + Yellow Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
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
            categories={categories}
            totalResultsCount={filteredSlots.length}
          />

          {/* Yellow Background Product Grid Container */}
          <div className="flex-1 w-full bg-yellow-400 rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl">
            {filteredSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSlots.map((slot) => (
                  <ListingCard
                    key={slot.id}
                    slot={slot}
                    onSelect={(selected) => setSelectedSlot(selected)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-black/90 p-12 sm:p-16 rounded-2xl text-center space-y-4 max-w-xl mx-auto my-8 border border-black/20 shadow-2xl text-white">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-amber-400">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-white font-mono">No Matching Approved Products</h3>
                <p className="text-sm text-zinc-400 font-sans">
                  No live approved products found matching "{searchQuery}". Store integrations must be approved in the Admin Portal before products go live.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedVendorId("all");
                      setSelectedCategory("All Products");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs font-mono hover:bg-amber-400 transition-all shadow-md"
                  >
                    Reset Filters & Search
                  </button>
                  <Link
                    href="/admin"
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-mono font-bold hover:bg-white/20 transition-all"
                  >
                    Open Admin Portal ↗
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 relative z-10 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <div>
            © 2026 MASTERS' UNION MARKETPLACE ENGINE • STAGE 1 SHOPIFY INTEGRATION & MODERATION PROTOCOL
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-amber-400 font-bold hover:underline">
              ADMIN MODERATION PORTAL ↗
            </Link>
            <span>•</span>
            <span>MODERATION ENFORCED</span>
          </div>
        </div>
      </footer>

      {/* Slide-out Listing Drawer */}
      <ListingDrawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
      />

    </div>
  );
}



