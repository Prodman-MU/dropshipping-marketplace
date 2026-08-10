"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  CheckCircle2,
  XCircle,
  Store,
  Package,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
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

  const handleAddStore = async (domain: string, token?: string, whatsappNumber?: string) => {
    try {
      const res = await fetch("/api/shopify/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, token, whatsappNumber }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Failed to connect store:", data.error);
        return;
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
    } catch (error) {
      console.error("Error in handleAddStore:", error);
    }
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
      <div className="min-h-screen bg-[#F4F4F0] text-[#111111] flex items-center justify-center p-4 selection:bg-[#FFB703] selection:text-[#111111]">
        <div className="w-full max-w-md bg-white border-4 border-[#111111] p-8 shadow-[10px_10px_0px_#111111] space-y-6 relative overflow-hidden">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#D62828] border-2 border-[#111111] flex items-center justify-center mx-auto text-white shadow-[3px_3px_0px_#111111]">
              <Lock className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-[#111111] tracking-tight font-display uppercase">
              Admin Moderation Portal
            </h1>
            <p className="text-xs text-[#2B2D42] font-mono font-bold">
              Protected Access Control for Shopify Store Integration & Moderation
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-black text-[#111111] uppercase tracking-wider mb-2">
                Admin Access Passkey
              </label>
              <input
                type="password"
                placeholder="Enter access key (default: admin123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-3 text-sm text-[#111111] font-mono font-bold placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-[#FFB703] transition-all"
              />
              {authError && (
                <p className="text-xs text-[#D62828] font-mono font-bold mt-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#D62828] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase"
            >
              Authenticate & Open Admin Moderation
            </button>
          </form>

          <div className="pt-4 border-t-2 border-[#111111] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#005F73] hover:underline"
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
    <div className="min-h-screen bg-[#F4F4F0] text-[#111111] selection:bg-[#FFB703] selection:text-[#111111]">
      
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b-4 border-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 bg-[#FFB703] border-2 border-[#111111] text-[#111111] hover:bg-[#D62828] hover:text-white transition-colors"
                title="Return to Public Website"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <div className="w-9 h-9 bg-[#D62828] border-2 border-[#111111] text-white flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                  <span>Shopify Store Moderation Panel</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-[#FFB703] text-[#111111] border border-[#111111]">
                    ACCESS CONTROLLED
                  </span>
                </h1>
                <p className="text-xs text-[#2B2D42] font-mono font-bold">
                  Approve or Reject Shopify stores before items go live publicly
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="px-4 py-2 bg-[#FFB703] text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-black flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-[#111111]" />
                <span>Link Shopify Store</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-[#E5E5E0] text-[#111111] border-2 border-[#111111] font-mono text-xs font-black uppercase hover:bg-[#D62828] hover:text-white transition-colors"
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
          <div className="p-5 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-1">
            <span className="text-xs font-mono font-black text-[#D62828] uppercase">Pending Approval</span>
            <div className="text-3xl font-black text-[#111111] font-mono flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#D62828] animate-pulse" />
              )}
            </div>
            <p className="text-[11px] text-[#2B2D42] font-mono font-bold">Requires admin review</p>
          </div>

          <div className="p-5 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-1">
            <span className="text-xs font-mono font-black text-[#005F73] uppercase">Approved Stores</span>
            <div className="text-3xl font-black text-[#005F73] font-mono">{activeCount}</div>
            <p className="text-[11px] text-[#2B2D42] font-mono font-bold">Live on public marketplace</p>
          </div>

          <div className="p-5 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-1">
            <span className="text-xs font-mono font-black text-[#D62828] uppercase">Rejected Stores</span>
            <div className="text-3xl font-black text-[#D62828] font-mono">{rejectedCount}</div>
            <p className="text-[11px] text-[#2B2D42] font-mono font-bold">Disabled integrations</p>
          </div>

          <div className="p-5 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-1">
            <span className="text-xs font-mono font-black text-[#111111] uppercase">Total Linked Stores</span>
            <div className="text-3xl font-black text-[#111111] font-mono">{merchants.length}</div>
            <p className="text-[11px] text-[#2B2D42] font-mono font-bold">Total connected accounts</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs border-b-2 border-[#111111] pb-4">
          <button
            onClick={() => setActiveFilter("PENDING")}
            className={`px-4 py-2 font-black flex items-center gap-2 border-2 border-[#111111] transition-all ${
              activeFilter === "PENDING"
                ? "bg-[#D62828] text-white shadow-[3px_3px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-[#FFB703]"
            }`}
          >
            <span>Pending Approval</span>
            <span className="px-2 py-0.5 bg-[#111111] text-[#FFB703] text-[11px]">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("ACTIVE")}
            className={`px-4 py-2 font-black flex items-center gap-2 border-2 border-[#111111] transition-all ${
              activeFilter === "ACTIVE"
                ? "bg-[#005F73] text-white shadow-[3px_3px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-[#FFB703]"
            }`}
          >
            <span>Active Stores</span>
            <span className="px-2 py-0.5 bg-[#111111] text-white text-[11px]">
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("REJECTED")}
            className={`px-4 py-2 font-black flex items-center gap-2 border-2 border-[#111111] transition-all ${
              activeFilter === "REJECTED"
                ? "bg-[#111111] text-white shadow-[3px_3px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-[#FFB703]"
            }`}
          >
            <span>Rejected Stores</span>
            <span className="px-2 py-0.5 bg-[#D62828] text-white text-[11px]">
              {rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-4 py-2 font-black border-2 border-[#111111] transition-all ${
              activeFilter === "ALL"
                ? "bg-[#FFB703] text-[#111111] shadow-[3px_3px_0px_#111111]"
                : "bg-white text-[#111111] hover:bg-[#FFB703]"
            }`}
          >
            All Stores ({merchants.length})
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
                  className="p-6 bg-white border-2 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-6 transition-all"
                >
                  {/* Store Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={merchant.storeLogo}
                        alt={merchant.name}
                        className="w-14 h-14 object-cover border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                      />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl font-black text-[#111111] font-display uppercase tracking-tight">
                            {merchant.name}
                          </h2>
                          {merchant.status === "PENDING" && (
                            <span className="px-3 py-1 text-xs font-mono font-black bg-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] animate-pulse">
                              ⏳ PENDING APPROVAL
                            </span>
                          )}
                          {merchant.status === "ACTIVE" && (
                            <span className="px-3 py-1 text-xs font-mono font-black bg-[#005F73] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
                              ✓ APPROVED & ACTIVE
                            </span>
                          )}
                          {merchant.status === "REJECTED" && (
                            <span className="px-3 py-1 text-xs font-mono font-black bg-[#D62828] text-white border-2 border-[#111111]">
                              ✕ REJECTED
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1.5 text-xs font-mono font-bold text-[#2B2D42]">
                          <span className="flex items-center gap-1.5 text-[#111111]">
                            <Store className="w-4 h-4 text-[#005F73]" />
                            {merchant.myshopifyDomain}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-[#D62828]" />
                            {storeSlots.length} Synced Products
                          </span>
                          <span>•</span>
                          <span className="text-[#2B2D42]">Connected: {merchant.connectedSince}</span>
                        </div>
                      </div>
                    </div>

                    {/* Approve / Reject Controls */}
                    <div className="flex items-center gap-3">
                      {merchant.status !== "ACTIVE" && (
                        <button
                          onClick={() => handleApprove(merchant.id)}
                          className="px-5 py-2.5 bg-[#005F73] text-white border-2 border-[#111111] bauhaus-btn font-mono text-xs font-black flex items-center gap-2 uppercase"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Store Integration</span>
                        </button>
                      )}

                      {merchant.status !== "REJECTED" && (
                        <button
                          onClick={() => handleReject(merchant.id)}
                          className="px-4 py-2.5 bg-[#D62828] text-white border-2 border-[#111111] bauhaus-btn font-mono text-xs font-black flex items-center gap-2 uppercase"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Store</span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setExpandedMerchantId(expandedMerchantId === merchant.id ? null : merchant.id)
                        }
                        className="p-2.5 bg-[#E5E5E0] border-2 border-[#111111] text-[#111111] hover:bg-[#FFB703] transition-colors"
                        title="Toggle product catalog preview"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 stroke-[3]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Fetched Product Preview List */}
                  {isExpanded && (
                    <div className="pt-4 border-t-2 border-[#111111] space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-black text-[#005F73] uppercase tracking-wider flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>Fetched Product Catalog Items ({storeSlots.length})</span>
                        </h3>
                        <span className="text-xs font-mono font-bold text-[#2B2D42]">
                          Photos, Descriptions & Variant Specs
                        </span>
                      </div>

                      {storeSlots.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {storeSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="p-4 bg-[#F4F4F0] border-2 border-[#111111] flex gap-4 overflow-hidden shadow-[3px_3px_0px_#111111]"
                            >
                              {slot.images && slot.images[0] && (
                                <img
                                  src={slot.images[0]}
                                  alt={slot.title}
                                  className="w-24 h-24 object-cover border-2 border-[#111111] shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1 space-y-1.5 font-mono">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-[#D62828]">
                                    {slot.slotNumber}
                                  </span>
                                  <span className="text-sm font-black text-[#111111] bg-[#FFB703] px-2 py-0.5 border border-[#111111]">
                                    {formatCurrency(slot.price, slot.currencyCode || "INR")}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-[#111111] truncate font-display uppercase">
                                  {slot.title}
                                </h4>
                                <p className="text-xs text-[#2B2D42] line-clamp-2 leading-relaxed font-sans font-medium">
                                  {slot.description}
                                </p>
                                <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-[#005F73]">
                                  <span>SKU: {slot.sku}</span>
                                  <span>•</span>
                                  <span>Stock: {slot.inventoryQuantity} units</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 bg-[#F4F4F0] border-2 border-[#111111] text-center font-mono text-xs font-bold text-[#2B2D42]">
                          No items synced for this store.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center space-y-4 bg-white border-4 border-[#111111] shadow-[8px_8px_0px_#111111]">
              <ShieldAlert className="w-12 h-12 text-[#D62828] mx-auto stroke-[2.5]" />
              <h3 className="text-lg font-black text-[#111111] font-display uppercase">No Stores Found</h3>
              <p className="text-xs font-mono font-bold text-[#2B2D42]">
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
