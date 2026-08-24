/**
 * @file page.tsx (under app/vendor/)
 * @description Apple Store Minimalist Vendor Analytics & Inventory Desk.
 * 
 * Features:
 * - Dual-pane access login screen with clean frosted card styling
 * - Minimalist metrics KPI cards with off-white containers and clean typography
 * - Modern zero-border product catalog inspection table
 * - Direct Shopify sync triggers & passcode management modal
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Store,
  Package,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  Search,
  RefreshCw,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
  LogOut,
  XCircle,
  ArrowLeft,
  KeyRound,
  Eye,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { MerchantVendor, SlotListing } from "@/data/mock-slots";
import { formatCurrency, cleanStoreDomain } from "@/lib/utils";
import {
  getInitialMerchants,
  getInitialSlots,
  saveMerchants,
  saveSlots,
  updateMerchantPasscode,
} from "@/lib/store-manager";
import { Header } from "@/components/Header";
import { ListingDrawer } from "@/components/ListingDrawer";
import { ConnectStoreModal } from "@/components/ConnectStoreModal";

const MASTER_VENDOR_PASSCODE = "vendor123";

export default function VendorDashboardPage() {
  const [merchants, setMerchants] = useState<MerchantVendor[]>([]);
  const [slots, setSlots] = useState<SlotListing[]>([]);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authVendorId, setAuthVendorId] = useState<string>("ALL");
  
  // Access Screen Pane State ("login" | "connect")
  const [accessPaneTab, setAccessPaneTab] = useState<"login" | "connect">("login");

  // Login Form Inputs
  const [loginPasscode, setLoginPasscode] = useState("");
  const [loginStoreId, setLoginStoreId] = useState<string>("ALL");
  const [authError, setAuthError] = useState("");
  const [storeSelectSearch, setStoreSelectSearch] = useState("");
  const [isStoreSelectOpen, setIsStoreSelectOpen] = useState(false);

  // Connect Store Form Inputs (Embedded Pane)
  const [connectDomain, setConnectDomain] = useState("");
  const [connectPasscode, setConnectPasscode] = useState("");
  const [connectToken, setConnectToken] = useState("");
  const [connectWhatsapp, setConnectWhatsapp] = useState("");
  const [connectSubmitting, setConnectSubmitting] = useState(false);
  const [connectSuccessMsg, setConnectSuccessMsg] = useState<string | null>(null);

  // Selected Vendor Filter ("ALL" or specific merchant id)
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>("ALL");
  
  // Inventory Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "AVAILABLE" | "RESERVED" | "SOLD">("ALL");

  // Selected Product for Popup Modal / Drawer
  const [selectedSlot, setSelectedSlot] = useState<SlotListing | null>(null);

  // Connect Store Modal (for authenticated view quick action)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Passcode Management State
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeCurrent, setPasscodeCurrent] = useState("");
  const [passcodeNew, setPasscodeNew] = useState("");
  const [passcodeConfirm, setPasscodeConfirm] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState("");
  const [passcodeSubmitting, setPasscodeSubmitting] = useState(false);

  // Load state on mount, hydrate live records from PostgreSQL, & check session storage auth
  useEffect(() => {
    const loadedMerchants = getInitialMerchants();
    const loadedSlots = getInitialSlots();
    setMerchants(loadedMerchants);
    setSlots(loadedSlots);

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
        console.warn("Failed to load live database records in vendor portal:", e);
      }
    };

    fetchLiveDbData();

    if (typeof window !== "undefined") {
      const authSession = sessionStorage.getItem("vendor_authenticated");
      const authVendorSession = sessionStorage.getItem("vendor_authenticated_id");
      if (authSession === "true" && authVendorSession) {
        setIsAuthenticated(true);
        setAuthVendorId(authVendorSession);
        setSelectedMerchantId(authVendorSession);
      }
    }

    const handleStateChange = () => {
      setMerchants(getInitialMerchants());
      setSlots(getInitialSlots());
    };

    window.addEventListener("store-state-changed", handleStateChange);
    return () => window.removeEventListener("store-state-changed", handleStateChange);
  }, []);

  const activeMerchants = useMemo(
    () => merchants.filter((m) => m.status === "ACTIVE"),
    [merchants]
  );

  const selectedLoginMerchant = useMemo(() => {
    if (loginStoreId === "ALL") return null;
    return merchants.find((m) => m.id === loginStoreId) || null;
  }, [merchants, loginStoreId]);

  const filteredLoginMerchants = useMemo(() => {
    if (!storeSelectSearch.trim()) return merchants;
    const q = storeSelectSearch.toLowerCase().trim();
    return merchants.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.myshopifyDomain.toLowerCase().includes(q)
    );
  }, [merchants, storeSelectSearch]);

  // Handle Login Authentication
  const handleVendorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = loginPasscode.trim().toLowerCase();

    // Check Master Passcode
    if (cleanPass === MASTER_VENDOR_PASSCODE) {
      setIsAuthenticated(true);
      setAuthVendorId(loginStoreId);
      setSelectedMerchantId(loginStoreId);
      setAuthError("");
      sessionStorage.setItem("vendor_authenticated", "true");
      sessionStorage.setItem("vendor_authenticated_id", loginStoreId);
      return;
    }

    // Check Store-Specific Passcode
    let matchedMerchant: MerchantVendor | undefined;

    if (loginStoreId !== "ALL") {
      const target = merchants.find((m) => m.id === loginStoreId);
      if (target) {
        const customPass = target.passcode ? target.passcode.trim().toLowerCase() : "";
        const expectedPass = target.name.split(" ")[0].toLowerCase() + "123";
        const domainPass = target.myshopifyDomain.split(".")[0].toLowerCase() + "123";
        if (cleanPass === customPass || cleanPass === expectedPass || cleanPass === domainPass) {
          matchedMerchant = target;
        }
      }
    } else {
      matchedMerchant = merchants.find((m) => {
        const customPass = m.passcode ? m.passcode.trim().toLowerCase() : "";
        const p1 = m.name.split(" ")[0].toLowerCase() + "123";
        const p2 = m.myshopifyDomain.split(".")[0].toLowerCase() + "123";
        return cleanPass === customPass || cleanPass === p1 || cleanPass === p2;
      });
    }

    if (matchedMerchant) {
      setIsAuthenticated(true);
      setAuthVendorId(matchedMerchant.id);
      setSelectedMerchantId(matchedMerchant.id);
      setAuthError("");
      sessionStorage.setItem("vendor_authenticated", "true");
      sessionStorage.setItem("vendor_authenticated_id", matchedMerchant.id);
    } else {
      setAuthError(
        "Invalid Vendor Access Passcode. Enter the custom password set when connecting your store, or try: vendor123 (Master)"
      );
    }
  };

  // Handle Store Connection inside Pane
  const handleEmbeddedConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDom = cleanStoreDomain(connectDomain);
    if (!cleanDom || !connectPasscode.trim()) return;

    setConnectSubmitting(true);
    try {
      const res = await fetch("/api/shopify/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: cleanDom,
          token: connectToken.trim() || undefined,
          whatsappNumber: connectWhatsapp.trim() || undefined,
          passcode: connectPasscode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || "Failed to connect store.");
        setConnectSubmitting(false);
        return;
      }

      const { merchant, slots: newSlots } = data;

      const currentM = getInitialMerchants();
      const currentS = getInitialSlots();

      const filteredM = currentM.filter((m) => m.myshopifyDomain !== merchant.myshopifyDomain);
      const filteredS = currentS.filter((s) => s.merchant.myshopifyDomain !== merchant.myshopifyDomain);

      const updatedM = [merchant, ...filteredM];
      const updatedS = [...(newSlots || []), ...filteredS];

      setMerchants(updatedM);
      setSlots(updatedS);
      saveMerchants(updatedM);
      saveSlots(updatedS);

      const createdMerchant = merchant as MerchantVendor;

      setConnectSuccessMsg(
        `Store "${createdMerchant.name}" connected and sent for approval to the admin!`
      );
      
      setLoginStoreId(createdMerchant.id);
      setLoginPasscode(connectPasscode);
      setConnectDomain("");
      setConnectPasscode("");
      setConnectToken("");
      setConnectWhatsapp("");

      setTimeout(() => {
        setConnectSuccessMsg(null);
        setAccessPaneTab("login");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Store connection error.");
    } finally {
      setConnectSubmitting(false);
    }
  };

  const handleVendorLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("vendor_authenticated");
    sessionStorage.removeItem("vendor_authenticated_id");
    setLoginPasscode("");
  };

  const handleAddStore = async (domain: string, token?: string, whatsappNumber?: string, passcode?: string) => {
    try {
      const res = await fetch("/api/shopify/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, token, whatsappNumber, passcode }),
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
      const updatedS = [...(newSlots || []), ...filteredS];

      setMerchants(updatedM);
      setSlots(updatedS);
      saveMerchants(updatedM);
      saveSlots(updatedS);
    } catch (err) {
      console.error("Add store error:", err);
    }
  };

  const handleUpdateStorePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError("");
    setPasscodeSuccessMsg("");

    if (!activeMerchantInfo) {
      setPasscodeError("Please select a specific store view to change its passcode.");
      return;
    }

    if (passcodeNew.trim().length < 4) {
      setPasscodeError("New passcode must be at least 4 characters.");
      return;
    }

    if (passcodeNew !== passcodeConfirm) {
      setPasscodeError("New passcode and confirmation do not match.");
      return;
    }

    setPasscodeSubmitting(true);
    try {
      const res = await fetch("/api/auth/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_vendor_passcode",
          merchantId: activeMerchantInfo.id,
          domain: activeMerchantInfo.myshopifyDomain,
          currentPasscode: passcodeCurrent,
          newPasscode: passcodeNew,
          isAdminOverride: loginPasscode.trim().toLowerCase() === MASTER_VENDOR_PASSCODE.toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update store passcode.");
      }

      const updatedM = updateMerchantPasscode(activeMerchantInfo.id, passcodeNew, merchants);
      setMerchants(updatedM);

      setPasscodeSuccessMsg("Passcode updated successfully!");
      setTimeout(() => {
        setIsPasscodeModalOpen(false);
        setPasscodeSuccessMsg("");
        setPasscodeCurrent("");
        setPasscodeNew("");
        setPasscodeConfirm("");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update passcode.";
      setPasscodeError(msg);
    } finally {
      setPasscodeSubmitting(false);
    }
  };

  const vendorSlots = useMemo(() => {
    if (selectedMerchantId === "ALL") return slots;
    return slots.filter((s) => s.merchant.id === selectedMerchantId);
  }, [slots, selectedMerchantId]);

  const activeMerchantInfo = useMemo(() => {
    if (selectedMerchantId === "ALL") return null;
    return merchants.find((m) => m.id === selectedMerchantId) || null;
  }, [merchants, selectedMerchantId]);

  const filteredSlots = useMemo(() => {
    return vendorSlots.filter((slot) => {
      const matchesSearch =
        slot.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" || slot.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" || slot.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [vendorSlots, searchQuery, selectedCategory, selectedStatus]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    vendorSlots.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [vendorSlots]);

  const metrics = useMemo(() => {
    const totalListings = vendorSlots.length;
    const availableCount = vendorSlots.filter((s) => s.status === "AVAILABLE").length;
    const totalInventoryUnits = vendorSlots.reduce((acc, s) => acc + s.inventoryQuantity, 0);

    const totalCatalogValue = vendorSlots.reduce(
      (acc, s) => acc + s.price * Math.max(1, s.inventoryQuantity),
      0
    );

    const avgPrice = totalListings > 0 ? totalCatalogValue / (totalListings || 1) : 0;

    const allSyncLogs = vendorSlots.flatMap((s) => s.syncLogs);
    const successfulLogs = allSyncLogs.filter((l) => l.status === "SUCCESS").length;
    const syncHealthScore =
      allSyncLogs.length > 0 ? Math.round((successfulLogs / allSyncLogs.length) * 100) : 100;

    return {
      totalListings,
      availableCount,
      totalInventoryUnits,
      totalCatalogValue,
      avgPrice,
      syncHealthScore,
      totalSyncLogsCount: allSyncLogs.length,
    };
  }, [vendorSlots]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    vendorSlots.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + 1;
    });
    return Object.entries(map).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / (vendorSlots.length || 1)) * 100),
    }));
  }, [vendorSlots]);

  // 1. UNAUTHENTICATED: DUAL-PANE VENDOR PORTAL ACCESS SCREEN (Login | Connect Store)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-[#111111] flex flex-col justify-between">
        <Header
          activeVendorCount={activeMerchants.length}
          totalSyncedProducts={slots.filter((s) => s.merchant.status === "ACTIVE").length}
        />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
          <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-10 shadow-xl space-y-6">
            
            {/* Header Icon & Title */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-800">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest block">
                VENDOR DESK
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl text-neutral-950 font-normal">
                Vendor Portal Access
              </h1>
              <p className="text-xs text-neutral-600">
                Manage your store catalog and dropshipping performance.
              </p>
            </div>

            {/* DUAL PANE TAB TOGGLE BAR */}
            <div className="flex p-1 rounded-full bg-neutral-100 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAccessPaneTab("login");
                }}
                className={`flex-1 py-2 px-3 rounded-full font-medium transition cursor-pointer ${
                  accessPaneTab === "login"
                    ? "bg-white text-black shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                <span>Vendor Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAccessPaneTab("connect");
                }}
                className={`flex-1 py-2 px-3 rounded-full font-medium transition cursor-pointer ${
                  accessPaneTab === "connect"
                    ? "bg-white text-black shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                <span>Connect Store</span>
              </button>
            </div>

            {/* Success Message Banner */}
            {connectSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{connectSuccessMsg}</span>
              </div>
            )}

            {/* PANE 1: VENDOR LOGIN FORM */}
            {accessPaneTab === "login" && (
              <form onSubmit={handleVendorLogin} className="space-y-4">
                {/* Searchable Store Selector Combobox */}
                <div className="relative">
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>1. Select Store</span>
                    <span className="text-[10px] text-neutral-400 font-normal lowercase">searchable</span>
                  </label>

                  {/* Combobox Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setIsStoreSelectOpen(!isStoreSelectOpen)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 hover:border-neutral-300 focus:border-black focus:bg-white text-xs font-mono text-neutral-900 flex items-center justify-between gap-2 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      {loginStoreId === "ALL" ? (
                        <>
                          <span className="text-sm shrink-0">🌐</span>
                          <span className="font-semibold text-neutral-950 truncate">ALL VENDORS (Master Access)</span>
                        </>
                      ) : selectedLoginMerchant ? (
                        <>
                          {selectedLoginMerchant.storeLogo ? (
                            <img
                              src={selectedLoginMerchant.storeLogo}
                              alt=""
                              className="w-4 h-4 rounded object-cover shrink-0"
                            />
                          ) : (
                            <span className="w-4 h-4 rounded bg-neutral-200 text-[9px] flex items-center justify-center font-bold shrink-0">
                              {selectedLoginMerchant.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <span className="font-semibold text-neutral-950 truncate">{selectedLoginMerchant.name}</span>
                          <span className="text-neutral-500 text-[10px] truncate">({selectedLoginMerchant.myshopifyDomain})</span>
                        </>
                      ) : (
                        <span className="text-neutral-500">Select a store...</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${isStoreSelectOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Searchable Dropdown Popup Menu */}
                  {isStoreSelectOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsStoreSelectOpen(false)}
                      />
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-neutral-200 shadow-xl z-30 p-2 space-y-2 max-h-64 flex flex-col">
                        {/* Search Filter Input */}
                        <div className="relative px-1 pt-1">
                          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Type store name or domain..."
                            value={storeSelectSearch}
                            onChange={(e) => setStoreSelectSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
                          />
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto space-y-0.5 pr-1 flex-1">
                          {/* All Vendors Option */}
                          {(!storeSelectSearch.trim() || "all vendors master access".includes(storeSelectSearch.toLowerCase().trim())) && (
                            <button
                              type="button"
                              onClick={() => {
                                setLoginStoreId("ALL");
                                setIsStoreSelectOpen(false);
                                setStoreSelectSearch("");
                              }}
                              className={`w-full px-3 py-2 rounded-lg text-left text-xs font-mono flex items-center justify-between transition cursor-pointer ${
                                loginStoreId === "ALL"
                                  ? "bg-neutral-900 text-white"
                                  : "hover:bg-neutral-100 text-neutral-800"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>🌐</span>
                                <span className="font-semibold">ALL VENDORS (Master Access)</span>
                              </div>
                              {loginStoreId === "ALL" && <Check className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Filtered Store Options */}
                          {filteredLoginMerchants.length > 0 ? (
                            filteredLoginMerchants.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setLoginStoreId(m.id);
                                  setIsStoreSelectOpen(false);
                                  setStoreSelectSearch("");
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-left text-xs font-mono flex items-center justify-between gap-2 transition cursor-pointer ${
                                  loginStoreId === m.id
                                    ? "bg-neutral-900 text-white"
                                    : "hover:bg-neutral-100 text-neutral-800"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 truncate">
                                  {m.storeLogo ? (
                                    <img src={m.storeLogo} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
                                  ) : (
                                    <span className={`w-4 h-4 rounded text-[9px] flex items-center justify-center font-bold shrink-0 ${loginStoreId === m.id ? "bg-neutral-700 text-white" : "bg-neutral-200 text-neutral-800"}`}>
                                      {m.name.slice(0, 2).toUpperCase()}
                                    </span>
                                  )}
                                  <span className="font-semibold truncate">{m.name}</span>
                                  <span className={`text-[10px] truncate ${loginStoreId === m.id ? "text-neutral-300" : "text-neutral-500"}`}>
                                    ({m.myshopifyDomain})
                                  </span>
                                </div>
                                {loginStoreId === m.id && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                              </button>
                            ))
                          ) : (
                            <div className="py-4 text-center text-neutral-400 font-mono text-xs">
                              No matching stores found
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    2. Access Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. apex123"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
                  />
                  {authError && (
                    <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="pill-btn-primary w-full py-3 text-xs font-semibold tracking-wider uppercase cursor-pointer"
                >
                  Authenticate & Open Desk
                </button>
              </form>
            )}

            {/* PANE 2: CONNECT NEW SHOPIFY STORE FORM */}
            {accessPaneTab === "connect" && (
              <form onSubmit={handleEmbeddedConnect} className="space-y-4">
                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Shopify Domain *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apex-gear.myshopify.com"
                    value={connectDomain}
                    onChange={(e) => setConnectDomain(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Set Store Passcode *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="e.g. apex123"
                    value={connectPasscode}
                    onChange={(e) => setConnectPasscode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    WhatsApp Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={connectWhatsapp}
                    onChange={(e) => setConnectWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={connectSubmitting || !connectDomain.trim() || !connectPasscode.trim()}
                  className="pill-btn-primary w-full py-3 text-xs font-semibold tracking-wider uppercase cursor-pointer disabled:opacity-50"
                >
                  {connectSubmitting ? "Connecting..." : "Connect & Link Store"}
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-neutral-100 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Marketplace</span>
              </Link>
            </div>

          </div>
        </div>

      </div>
    );
  }

  const [isSyncingStore, setIsSyncingStore] = useState(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  const handleSyncStore = async (domainToSync?: string) => {
    const targetDomain = domainToSync || (selectedMerchantId !== "ALL" ? activeMerchantInfo?.myshopifyDomain : undefined);
    
    setIsSyncingStore(true);
    try {
      if (!targetDomain) {
        const res = await fetch("/api/cron/sync", { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(`Sync failed: ${data.error || "Could not sync stores."}`);
          return;
        }
      } else {
        const res = await fetch("/api/shopify/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: targetDomain }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(`Sync failed: ${data.error || "Could not reach store."}`);
          return;
        }
      }

      const [mRes, lRes] = await Promise.all([
        fetch("/api/merchants").then((r) => r.json()).catch(() => null),
        fetch("/api/listings").then((r) => r.json()).catch(() => null),
      ]);

      if (mRes?.merchants) {
        setMerchants(mRes.merchants);
        saveMerchants(mRes.merchants);
      }
      if (lRes?.slots) {
        setSlots(lRes.slots);
        saveSlots(lRes.slots);
      }

      setSyncSuccessToast(`Store catalog updated live from Shopify!`);
      setTimeout(() => setSyncSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Sync error: ${err.message || "Failed to update catalog."}`);
    } finally {
      setIsSyncingStore(false);
    }
  };

  // 2. AUTHENTICATED: VENDOR DASHBOARD
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans">
      <Header
        activeVendorCount={activeMerchants.length}
        totalSyncedProducts={slots.filter((s) => s.merchant.status === "ACTIVE").length}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Sync Success Toast */}
        {syncSuccessToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncSuccessToast}</span>
            </div>
            <button type="button" onClick={() => setSyncSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950">✕</button>
          </div>
        )}

        {/* Banner Title & Vendor Status Header */}
        <div className="bg-[#F8F9FA] rounded-3xl border border-neutral-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-200 text-neutral-800 font-mono text-[10px] font-semibold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AUTHENTICATED VENDOR DESK</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-normal text-neutral-950">
              {activeMerchantInfo ? `${activeMerchantInfo.name} Portal` : "Vendor Analytics Desk"}
            </h1>
            <p className="text-xs text-neutral-600">
              Manage inventory, analyze catalog metrics, and inspect storefront listings.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSyncStore()}
              disabled={isSyncingStore}
              className="pill-btn-secondary px-4 py-2 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStore ? "animate-spin" : ""}`} />
              <span>{isSyncingStore ? "Syncing..." : "Sync Catalog"}</span>
            </button>

            {activeMerchantInfo && (
              <button
                type="button"
                onClick={() => {
                  setPasscodeError("");
                  setPasscodeSuccessMsg("");
                  setPasscodeCurrent("");
                  setPasscodeNew("");
                  setPasscodeConfirm("");
                  setIsPasscodeModalOpen(true);
                }}
                className="pill-btn-secondary px-4 py-2 text-xs font-medium flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Passcode</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsConnectModalOpen(true)}
              className="pill-btn-primary px-4 py-2 text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Store</span>
            </button>

            <button
              type="button"
              onClick={handleVendorLogout}
              className="pill-btn-secondary text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2 text-xs font-medium flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Vendor Selector Dropdown Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-neutral-600" />
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Store View</span>
              <span className="font-semibold text-neutral-900 uppercase">
                {selectedMerchantId === "ALL" ? "All Marketplace Vendors (Aggregated)" : activeMerchantInfo?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 font-mono text-xs font-medium text-neutral-900 focus:outline-none focus:border-black w-full sm:w-64"
            >
              <option value="ALL">🌐 ALL STORES (Aggregated)</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.status === "ACTIVE" ? "🟢" : "🟡"} {m.name} ({m.myshopifyDomain})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* METRICS KPI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 p-5 space-y-1">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Est. Catalog Value
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-neutral-950">
              {formatCurrency(metrics.totalCatalogValue, "INR")}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Catalog value</span>
            </p>
          </div>

          <div className="bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 p-5 space-y-1">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Active Listings
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-neutral-950">
              {metrics.availableCount} / {metrics.totalListings}
            </div>
            <p className="text-[11px] text-neutral-500">Live on marketplace</p>
          </div>

          <div className="bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 p-5 space-y-1">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Product Categories
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-neutral-950">
              {categories.length}
            </div>
            <p className="text-[11px] text-neutral-500">Across catalog</p>
          </div>

          <div className="bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 p-5 space-y-1">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Webhook Health
            </span>
            <div className="text-2xl sm:text-3xl font-semibold text-neutral-950 flex items-center gap-2">
              <span>{metrics.syncHealthScore}%</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              {metrics.totalSyncLogsCount} sync events
            </p>
          </div>

        </div>

        {/* INVENTORY LISTINGS TABLE */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="font-editorial text-xl sm:text-2xl text-neutral-950 font-normal">
                Inventory Catalog ({filteredSlots.length})
              </h2>
              <p className="text-xs text-neutral-500">
                Click any product to inspect specifications and multi-variant pricing.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-mono text-xs">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 font-mono text-xs text-neutral-900 focus:outline-none focus:border-black"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 font-mono text-xs text-neutral-900 focus:outline-none focus:border-black"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold Out</option>
              </select>
            </div>
          </div>

          {/* Product Listings Table */}
          {filteredSlots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-neutral-200/80 text-neutral-500 font-medium">
                  <tr>
                    <th className="py-3 px-4">Product Info</th>
                    <th className="py-3 px-4">Vendor Store</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {filteredSlots.map((slot) => (
                    <tr
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className="hover:bg-neutral-50 cursor-pointer transition group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {slot.images && slot.images[0] ? (
                            <img
                              src={slot.images[0]}
                              alt={slot.title}
                              className="w-10 h-10 rounded-lg object-cover bg-[#F5F5F7] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-[9px] font-mono text-neutral-400">
                              NO IMG
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-neutral-900 group-hover:text-black line-clamp-1">
                              {slot.title}
                            </h4>
                            <span className="font-mono text-[10px] text-neutral-400">SKU: {slot.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-700">
                        {slot.merchant.name}
                      </td>

                      <td className="py-3 px-4">
                        <span className="status-pill text-[10px]">
                          {slot.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-neutral-950">
                        {formatCurrency(slot.price, slot.currencyCode || "INR")}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {slot.inventoryQuantity <= 0 && !slot.isUnknownQuantity ? (
                          <span className="text-red-600 font-semibold">Out of Stock</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">In Stock</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="status-pill text-[10px]">
                          {slot.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlot(slot);
                          }}
                          className="pill-btn-secondary px-3 py-1 text-[11px] font-medium inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Specs</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#F8F9FA] text-center space-y-2 font-mono">
              <Package className="w-6 h-6 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-semibold text-neutral-900">No Product Listings Found</h3>
              <p className="text-xs text-neutral-500">
                Try updating your search query or clearing category filters.
              </p>
            </div>
          )}

        </div>

      </main>

      {/* Product Detail Modal */}
      <ListingDrawer
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onSelectRelatedSlot={(relSlot) => setSelectedSlot(relSlot)}
      />

      {/* Connect Store Modal */}
      <ConnectStoreModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleAddStore}
      />

      {/* Passcode Modal */}
      {isPasscodeModalOpen && activeMerchantInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-editorial text-lg text-neutral-950 font-normal">
                Change Store Passcode
              </h3>
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(false)}
                className="text-neutral-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            {passcodeError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {passcodeError}
              </div>
            )}

            {passcodeSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium">
                {passcodeSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateStorePasscode} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] text-neutral-700 uppercase mb-1">Current Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current passcode"
                  value={passcodeCurrent}
                  onChange={(e) => setPasscodeCurrent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-neutral-700 uppercase mb-1">New Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 4 characters"
                  value={passcodeNew}
                  onChange={(e) => setPasscodeNew(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-neutral-700 uppercase mb-1">Confirm New Passcode</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new passcode"
                  value={passcodeConfirm}
                  onChange={(e) => setPasscodeConfirm(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasscodeModalOpen(false)}
                  className="pill-btn-secondary px-4 py-2 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passcodeSubmitting || !passcodeNew.trim()}
                  className="pill-btn-primary px-5 py-2 text-xs font-semibold"
                >
                  {passcodeSubmitting ? "Updating..." : "Save Passcode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
