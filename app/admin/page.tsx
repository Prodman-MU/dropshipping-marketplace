"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Store,
  Package,
  Clock,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Activity,
  Layers,
} from "lucide-react";
import { MerchantVendor, SlotListing } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";
import {
  getInitialMerchants,
  getInitialSlots,
  saveMerchants,
  saveSlots,
  approveMerchantStore,
  rejectMerchantStore,
} from "@/lib/store-manager";
import { ConnectStoreModal } from "@/components/ConnectStoreModal";

const ADMIN_PASSCODE = "admin123";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [merchants, setMerchants] = useState<MerchantVendor[]>([]);
  const [slots, setSlots] = useState<SlotListing[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "REJECTED">("PENDING");
  const [expandedMerchantId, setExpandedMerchantId] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Load initial store state on mount
  useEffect(() => {
    setMerchants(getInitialMerchants());
    setSlots(getInitialSlots());

    // Listen for cross-tab or component state updates
    const handleStateChange = () => {
      setMerchants(getInitialMerchants());
      setSlots(getInitialSlots());
    };
    window.addEventListener("store-state-changed", handleStateChange);
    return () => window.removeEventListener("store-state-changed", handleStateChange);
  }, []);

  // Check stored auth session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("admin_authenticated");
      if (auth === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("admin_authenticated", "true");
    } else {
      setAuthError("Invalid Admin Access Key. Try: admin123");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setPasscode("");
  };

  const handleApprove = (merchantId: string) => {
    const { updatedMerchants, updatedSlots } = approveMerchantStore(merchantId, merchants, slots);
    setMerchants(updatedMerchants);
    setSlots(updatedSlots);
  };

  const handleReject = (merchantId: string) => {
    const { updatedMerchants, updatedSlots } = rejectMerchantStore(merchantId, merchants, slots);
    setMerchants(updatedMerchants);
    setSlots(updatedSlots);
  };

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
        { id: `log-${Date.now()}`, eventType: "products/create", status: "SUCCESS", timestamp: new Date().toLocaleTimeString(), details: "Storefront linked & items fetched. Published live." }
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
        { id: `log-${Date.now()}-2`, eventType: "products/create", status: "SUCCESS", timestamp: new Date().toLocaleTimeString(), details: "Storefront linked & items fetched. Published live." }
      ]
    };

    const updatedM = [newMerchant, ...merchants];
    const updatedS = [newSlot1, newSlot2, ...slots];
    setMerchants(updatedM);
    setSlots(updatedS);
    saveMerchants(updatedM);
    saveSlots(updatedS);
  };

  const pendingCount = merchants.filter((m) => m.status === "PENDING").length;
  const activeCount = merchants.filter((m) => m.status === "ACTIVE").length;
  const rejectedCount = merchants.filter((m) => m.status === "REJECTED").length;

  const filteredMerchants = merchants.filter((m) => {
    if (activeFilter === "PENDING") return m.status === "PENDING";
    if (activeFilter === "ACTIVE") return m.status === "ACTIVE";
    if (activeFilter === "REJECTED") return m.status === "REJECTED";
    return true;
  });

  // ACCESS CONTROL GATE (LOGIN)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
        <div className="w-full max-w-md bg-[#121216] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight font-sans">
              Admin Moderation Portal
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Protected Access Control for Shopify Store Integration & Moderation
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                Admin Access Passkey
              </label>
              <input
                type="password"
                placeholder="Enter access key (default: admin123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              {authError && (
                <p className="text-xs text-rose-400 font-mono mt-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-bold text-sm hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/20 transition-all"
            >
              Authenticate & Open Admin Moderation
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-amber-500 selection:text-black">
      
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#121216]/90 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                title="Return to Public Website"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Shopify Store Moderation Panel</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ACCESS CONTROLLED
                  </span>
                </h1>
                <p className="text-xs text-zinc-400 font-mono">
                  Approve or Reject Shopify stores before items go live publicly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <Store className="w-4 h-4" />
                <span>Link Shopify Store</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-400 hover:text-white transition-all"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        
        {/* Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-1">
            <span className="text-xs font-mono text-zinc-400 uppercase">Pending Approval</span>
            <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">Requires admin review</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-1">
            <span className="text-xs font-mono text-zinc-400 uppercase">Approved Stores</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">{activeCount}</div>
            <p className="text-[11px] text-zinc-500 font-mono">Live on public marketplace</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-1">
            <span className="text-xs font-mono text-zinc-400 uppercase">Rejected Stores</span>
            <div className="text-2xl font-black text-rose-400 font-mono">{rejectedCount}</div>
            <p className="text-[11px] text-zinc-500 font-mono">Disabled integrations</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121216] border border-white/10 space-y-1">
            <span className="text-xs font-mono text-zinc-400 uppercase">Total Linked Stores</span>
            <div className="text-2xl font-black text-white font-mono">{merchants.length}</div>
            <p className="text-[11px] text-zinc-500 font-mono">Total connected accounts</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveFilter("PENDING")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeFilter === "PENDING"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            <span>Pending Approval</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-amber-300 text-[11px]">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("ACTIVE")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeFilter === "ACTIVE"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            <span>Active Stores</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-amber-300 text-[11px]">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("REJECTED")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeFilter === "REJECTED"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            <span>Rejected Stores</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 text-amber-300 text-[11px]">
              {rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeFilter === "ALL"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
            }`}
          >
            All ({merchants.length})
          </button>
        </div>

        {/* Stores List */}
        <div className="space-y-6">
          {filteredMerchants.length > 0 ? (
            filteredMerchants.map((merchant) => {
              const storeSlots = slots.filter((s) => s.merchant.id === merchant.id);
              const isExpanded = expandedMerchantId === merchant.id || activeFilter === "PENDING";

              return (
                <div
                  key={merchant.id}
                  className="p-6 rounded-3xl bg-[#121216] border border-white/10 space-y-6 shadow-2xl transition-all"
                >
                  {/* Store Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={merchant.storeLogo}
                        alt={merchant.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl font-bold text-white tracking-wide">
                            {merchant.name}
                          </h2>
                          {merchant.status === "PENDING" && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                              ⏳ PENDING APPROVAL
                            </span>
                          )}
                          {merchant.status === "ACTIVE" && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              ✓ APPROVED & ACTIVE
                            </span>
                          )}
                          {merchant.status === "REJECTED" && (
                            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                              ✕ REJECTED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-xs font-mono text-zinc-400">
                          <span className="flex items-center gap-1.5 text-zinc-200">
                            <Store className="w-4 h-4 text-amber-400" />
                            {merchant.myshopifyDomain}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-zinc-500" />
                            {storeSlots.length} Synced Products
                          </span>
                          <span>•</span>
                          <span className="text-zinc-500">Connected: {merchant.connectedSince}</span>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Reject Controls */}
                    <div className="flex items-center gap-3">
                      {merchant.status !== "ACTIVE" && (
                        <button
                          onClick={() => handleApprove(merchant.id)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-bold font-mono text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Store Integration</span>
                        </button>
                      )}

                      {merchant.status !== "REJECTED" && (
                        <button
                          onClick={() => handleReject(merchant.id)}
                          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono text-xs font-bold flex items-center gap-2 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Store</span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setExpandedMerchantId(expandedMerchantId === merchant.id ? null : merchant.id)
                        }
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                        title="Toggle product catalog preview"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Fetched Product Preview List */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>Fetched Product Catalog Items ({storeSlots.length})</span>
                        </h3>
                        <span className="text-xs font-mono text-zinc-400">
                          Photos, Descriptions & Variant Specs
                        </span>
                      </div>

                      {storeSlots.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storeSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="p-4 rounded-2xl bg-black/80 border border-white/10 flex gap-4 overflow-hidden shadow-lg"
                            >
                              {slot.images && slot.images[0] && (
                                <img
                                  src={slot.images[0]}
                                  alt={slot.title}
                                  className="w-24 h-24 rounded-xl object-cover border border-white/10 shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1 space-y-1.5 font-mono">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-amber-400">
                                    {slot.slotNumber}
                                  </span>
                                  <span className="text-sm font-bold text-white">
                                    {formatCurrency(slot.price)}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-white truncate font-sans">
                                  {slot.title}
                                </h4>
                                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                                  {slot.description}
                                </p>
                                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                                  <span>SKU: {slot.sku}</span>
                                  <span>•</span>
                                  <span>Stock: {slot.inventoryQuantity} units</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl bg-white/5 text-center font-mono text-xs text-zinc-400">
                          No items synced for this store.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center space-y-4 bg-[#121216] rounded-3xl border border-white/10">
              <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-white font-mono">No Stores Found</h3>
              <p className="text-xs text-zinc-400 font-mono">
                No store integrations found matching filter ({activeFilter}).
              </p>
            </div>
          )}
        </div>

      </main>

      {/* Connect Store Modal */}
      <ConnectStoreModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleAddStore}
      />
    </div>
  );
}
