"use client";

import React, { useState, useMemo } from "react";
import { BackgroundVideo } from "@/components/BackgroundVideo";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { VendorFilterBar } from "@/components/VendorFilterBar";
import { ListingCard } from "@/components/ListingCard";
import { ListingDrawer } from "@/components/ListingDrawer";
import { MOCK_MERCHANTS, MOCK_SLOTS, SlotListing, MerchantVendor } from "@/data/mock-slots";

export default function MarketplaceHomePage() {
  const [merchants, setMerchants] = useState<MerchantVendor[]>(MOCK_MERCHANTS);
  const [slots, setSlots] = useState<SlotListing[]>(MOCK_SLOTS);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState("slot-asc");

  const [selectedSlot, setSelectedSlot] = useState<SlotListing | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Extract unique product categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    MOCK_SLOTS.forEach((s) => set.add(s.category));
    return ["All Products", ...Array.from(set)];
  }, []);

  // Handler to add new merchant store dynamically
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
      description: "Directly synced product asset from newly connected Shopify Storefront.",
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
        { id: `log-${Date.now()}`, eventType: "products/create", status: "SUCCESS", timestamp: new Date().toLocaleTimeString(), details: "Storefront connected & initial slot generated" }
      ]
    };

    setMerchants((prev) => [newMerchant, ...prev]);
    setSlots((prev) => [newSlot1, ...prev]);
  };

  // Product-Centric Filter & Sort Logic (Vendor, Category, Search, Sort)
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Vendor filter
      if (selectedVendorId !== "all" && slot.merchant.id !== selectedVendorId) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "All Products" && slot.category !== selectedCategory) {
        return false;
      }
      // Search query (Title, Slot Number, SKU, Tags, Vendor)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = slot.title.toLowerCase().includes(q);
        const matchesSlot = slot.slotNumber.toLowerCase().includes(q);
        const matchesSKU = slot.sku.toLowerCase().includes(q);
        const matchesTags = slot.tags.some((t) => t.toLowerCase().includes(q));
        const matchesVendor = slot.merchant.myshopifyDomain.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSlot && !matchesSKU && !matchesTags && !matchesVendor) {
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
    <div className="min-h-screen bg-[#090A0F] text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* Scrollable Ambient Background Video */}
      <BackgroundVideo
        isEnabled={isVideoEnabled}
        onToggle={() => setIsVideoEnabled(!isVideoEnabled)}
      />

      {/* Glassmorphic Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeVendorCount={merchants.length}
        totalSyncedProducts={slots.length}
        isVideoEnabled={isVideoEnabled}
        onToggleVideo={() => setIsVideoEnabled(!isVideoEnabled)}
        onAddStore={handleAddStore}
      />

      {/* Clean Product-Centric Hero Section */}
      <Hero />

      {/* Product Filter Bar with Search Bar */}
      <VendorFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vendors={merchants}
        selectedVendorId={selectedVendorId}
        onSelectVendor={setSelectedVendorId}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
        totalResultsCount={filteredSlots.length}
      />

      {/* Main Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {filteredSlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlots.map((slot) => (
              <ListingCard
                key={slot.id}
                slot={slot}
                onSelect={(selected) => setSelectedSlot(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-16 rounded-3xl text-center space-y-4 max-w-xl mx-auto my-12 border border-white/10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white font-mono">No Matching Product Slots</h3>
            <p className="text-sm text-zinc-400 font-sans">
              No products found matching "{searchQuery}". Try clearing search or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedVendorId("all");
                setSelectedCategory("All Products");
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-all"
            >
              Reset Filters & Search
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 relative z-10 bg-[#090A0F]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <div>
            © 2026 DELOREAN MARKETPLACE x MASTERS' UNION ENGINE • PRODUCT CATALOG MARKETPLACE
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">SHOPIFY STOREFRONT API v2024.04</span>
            <span>•</span>
            <span>WEBHOOK SECURED</span>
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
