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
  Filter,
  RefreshCw,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  Eye,
  Lightbulb,
  Lock,
  LogOut,
  XCircle,
  ArrowLeft,
  KeyRound,
  ArrowRight,
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
      // Find matching merchant by passcode
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

      // Update merchant list (avoid duplicates) and persist
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
        `✅ Store "${createdMerchant.name}" connected and sent for approval to the admin! Products will go live on the public catalog once approved.`
      );
      
      // Auto pre-fill login inputs
      setLoginStoreId(createdMerchant.id);
      setLoginPasscode(connectPasscode);
      setConnectDomain("");
      setConnectPasscode("");
      setConnectToken("");
      setConnectWhatsapp("");

      setTimeout(() => {
        setConnectSuccessMsg(null);
        setAccessPaneTab("login");
      }, 3500);
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
      // 1. Send update to API (sync with database)
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

      // 2. Update local state
      const updatedM = updateMerchantPasscode(activeMerchantInfo.id, passcodeNew, merchants);
      setMerchants(updatedM);

      setPasscodeSuccessMsg("✅ Passcode updated successfully! Use your new passcode on your next login.");
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

  // Filter listings by selected vendor
  const vendorSlots = useMemo(() => {
    if (selectedMerchantId === "ALL") return slots;
    return slots.filter((s) => s.merchant.id === selectedMerchantId);
  }, [slots, selectedMerchantId]);

  // Current Active Merchant Info
  const activeMerchantInfo = useMemo(() => {
    if (selectedMerchantId === "ALL") return null;
    return merchants.find((m) => m.id === selectedMerchantId) || null;
  }, [merchants, selectedMerchantId]);

  // Filtered slots for table/grid view
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

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    vendorSlots.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [vendorSlots]);

  // Calculated Metrics KPI Dashboard
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

  // Category Distribution calculation
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
      <div className="min-h-screen bg-[#F4F4F0] text-[#111111] flex flex-col justify-between selection:bg-[#FFB703]">
        <Header
          activeVendorCount={activeMerchants.length}
          totalSyncedProducts={slots.filter((s) => s.merchant.status === "ACTIVE").length}
        />

        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
          <div className="w-full max-w-lg bg-white border-4 border-[#111111] p-6 sm:p-8 shadow-[10px_10px_0px_#111111] space-y-6">
            
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#111111] border-2 border-[#111111] text-[#FFB703] flex items-center justify-center mx-auto shadow-[4px_4px_0px_#D62828]">
                <KeyRound className="w-7 h-7 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-mono font-black text-[#005F73] uppercase tracking-wider block">
                MASTERS UNION VENDOR DESK
              </span>
              <h1 className="text-2xl font-black text-[#111111] tracking-tight font-display uppercase">
                Vendor Portal Access
              </h1>
              <p className="text-xs text-[#2B2D42] font-mono font-semibold">
                Log in to your store desk or connect a new Shopify storefront.
              </p>
            </div>

            {/* DUAL PANE TAB TOGGLE BAR */}
            <div className="flex border-4 border-[#111111] bg-[#F4F4F0] font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAccessPaneTab("login");
                }}
                className={`flex-1 py-3 px-3 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  accessPaneTab === "login"
                    ? "bg-[#111111] text-[#FFB703] shadow-[2px_2px_0px_#D62828]"
                    : "text-[#111111] hover:bg-[#FFB703]"
                }`}
              >
                <Lock className="w-4 h-4 text-[#FFB703]" />
                <span>01 // Vendor Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError("");
                  setAccessPaneTab("connect");
                }}
                className={`flex-1 py-3 px-3 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                  accessPaneTab === "connect"
                    ? "bg-[#111111] text-[#FFB703] shadow-[2px_2px_0px_#D62828]"
                    : "text-[#111111] hover:bg-[#FFB703]"
                }`}
              >
                <Plus className="w-4 h-4 text-[#FFB703] stroke-[3]" />
                <span>02 // Connect Store</span>
              </button>
            </div>

            {/* Success Message Banner */}
            {connectSuccessMsg && (
              <div className="p-3 bg-emerald-300 border-2 border-[#111111] font-mono text-xs font-black uppercase flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-900 shrink-0" />
                <span>{connectSuccessMsg}</span>
              </div>
            )}

            {/* PANE 1: VENDOR LOGIN FORM */}
            {accessPaneTab === "login" && (
              <form onSubmit={handleVendorLogin} className="space-y-4 font-mono">
                
                {/* Store Selection */}
                <div>
                  <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1.5">
                    1. Select Vendor Store
                  </label>
                  <select
                    value={loginStoreId}
                    onChange={(e) => setLoginStoreId(e.target.value)}
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3.5 py-2.5 text-xs text-[#111111] font-bold uppercase focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFB703]"
                  >
                    <option value="ALL">🌐 ALL VENDORS (Master Access)</option>
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.myshopifyDomain})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Passcode Input */}
                <div>
                  <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1.5">
                    2. Vendor Access Passcode
                  </label>
                  <input
                    type="password"
                    placeholder="Enter store passcode (e.g. apex123)"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    required
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-3 text-sm text-[#111111] font-bold placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-[#FFB703] transition-all"
                  />
                  {authError && (
                    <p className="text-[11px] text-[#D62828] font-bold mt-2 flex items-start gap-1">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#111111] hover:bg-[#D62828] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_#FFB703] transition-all"
                >
                  <Lock className="w-4 h-4 text-[#FFB703]" />
                  <span>Authenticate & Open Vendor Desk</span>
                </button>

                {/* Demo Passkey Tips */}
                <div className="bg-[#F4F4F0] border-2 border-[#111111] p-3 space-y-1 font-mono text-[10px]">
                  <span className="font-black text-[#005F73] block uppercase">// DEMO ACCESS PASSKEYS:</span>
                  <p className="text-[#111111] font-semibold">
                    • <strong className="text-[#D62828]">Master Key:</strong> <code className="bg-white px-1 border border-[#111111]">vendor123</code><br />
                    • <strong className="text-[#005F73]">Store Passkeys:</strong> <code className="bg-white px-1 border border-[#111111]">apex123</code>, <code className="bg-white px-1 border border-[#111111]">threads123</code>, <code className="bg-white px-1 border border-[#111111]">tech123</code>
                  </p>
                </div>
              </form>
            )}

            {/* PANE 2: CONNECT NEW SHOPIFY STORE FORM */}
            {accessPaneTab === "connect" && (
              <form onSubmit={handleEmbeddedConnect} className="space-y-4 font-mono">
                {authError && (
                  <div className="p-3 bg-red-100 border-2 border-[#D62828] font-mono text-xs font-bold text-[#D62828] flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-[#D62828] shrink-0 mt-0.5" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Field 1: Shopify Site Name / Domain */}
                <div>
                  <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>1. Shopify Site Name / Domain *</span>
                    <span className="text-[10px] text-[#D62828] font-bold">REQUIRED</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. apex-gear or apex-gear.myshopify.com"
                    value={connectDomain}
                    onChange={(e) => setConnectDomain(e.target.value)}
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-xs text-[#111111] font-bold focus:outline-none focus:bg-white focus:border-[#FFB703]"
                  />
                </div>

                {/* Field 2: Set Store Vendor Passcode */}
                <div>
                  <label className="block text-xs font-black text-[#D62828] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>2. Set Store Vendor Passcode *</span>
                    <span className="text-[10px] text-[#005F73] font-bold">REQUIRED FOR LOGIN</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create your portal passcode (e.g. apex123)"
                    value={connectPasscode}
                    onChange={(e) => setConnectPasscode(e.target.value)}
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-xs text-[#111111] font-bold focus:outline-none focus:bg-white focus:border-[#FFB703]"
                  />
                  <p className="text-[10px] text-[#2B2D42] mt-1 font-bold">
                    🔑 Passcode used by the store owner to log in to the /vendor portal desk.
                  </p>
                </div>

                {/* Field 3: WhatsApp Number (Optional) */}
                <div>
                  <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1">
                    3. WhatsApp Owner Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={connectWhatsapp}
                    onChange={(e) => setConnectWhatsapp(e.target.value)}
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-xs text-[#111111] font-bold focus:outline-none focus:bg-white focus:border-[#FFB703]"
                  />
                </div>

                {/* Field 4: Storefront API Token (Optional) */}
                <div>
                  <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1">
                    4. Access Token (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="shpat_xxxxxxxx / shpca_xxxxxxxx"
                    value={connectToken}
                    onChange={(e) => setConnectToken(e.target.value)}
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-xs text-[#111111] font-bold focus:outline-none focus:bg-white focus:border-[#FFB703]"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={connectSubmitting || !connectDomain.trim() || !connectPasscode.trim()}
                  className="w-full py-3.5 bg-[#D62828] hover:bg-[#111111] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center justify-center gap-2 shadow-[3px_3px_0px_#FFB703] transition-all disabled:opacity-50"
                >
                  {connectSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying & Linking Store...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-[#FFB703] stroke-[3]" />
                      <span>Connect & Link Shopify Store</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Footer Link */}
            <div className="pt-2 text-center border-t-2 border-[#111111]">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#005F73] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Marketplace</span>
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
        // Trigger all active stores sync via cron endpoint
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

      // Re-hydrate listings and merchants from server DB
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

      setSyncSuccessToast(`✅ Store catalog updated live from Shopify!`);
      setTimeout(() => setSyncSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Sync error: ${err.message || "Failed to update catalog."}`);
    } finally {
      setIsSyncingStore(false);
    }
  };

  // 2. AUTHENTICATED: VENDOR DASHBOARD
  return (
    <div className="min-h-screen bg-[#F4F4F0] text-[#111111] flex flex-col selection:bg-[#FFB703]">
      {/* Top Header */}
      <Header
        activeVendorCount={activeMerchants.length}
        totalSyncedProducts={slots.filter((s) => s.merchant.status === "ACTIVE").length}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-5 py-8 space-y-8">
        
        {/* Sync Success Toast */}
        {syncSuccessToast && (
          <div className="p-3.5 bg-emerald-300 border-2 border-[#111111] shadow-[4px_4px_0px_#111111] font-mono text-xs font-black uppercase flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-950 shrink-0" />
              <span>{syncSuccessToast}</span>
            </div>
            <button onClick={() => setSyncSuccessToast(null)} className="font-black text-sm">✕</button>
          </div>
        )}

        {/* Banner Title & Vendor Status Header */}
        <div className="bg-white border-4 border-[#111111] p-6 shadow-[8px_8px_0px_#111111] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#FFB703] font-mono text-xs font-black uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AUTHENTICATED VENDOR DESK</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#111111] uppercase tracking-tight">
              {activeMerchantInfo ? `${activeMerchantInfo.name} Portal` : "Vendor Analytics Desk"}
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[#2B2D42] font-semibold">
              Manage inventory, analyze catalog performance metrics, and inspect storefront listings.
            </p>
          </div>

          {/* Action CTAs: Sync Catalog, Change Passcode, Connect Store & Logout */}
          <div className="flex items-center flex-wrap gap-2.5 font-mono">
            {/* Sync Catalog Button */}
            <button
              onClick={() => handleSyncStore()}
              disabled={isSyncingStore}
              className="py-2.5 px-4 bg-[#005F73] hover:bg-[#111111] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-60"
              title="Pull latest live products, pricing, and variants from Shopify"
            >
              <RefreshCw className={`w-4 h-4 text-[#FFB703] ${isSyncingStore ? "animate-spin" : ""}`} />
              <span>{isSyncingStore ? "Syncing..." : "Sync Store Catalog"}</span>
            </button>

            {activeMerchantInfo && (
              <button
                onClick={() => {
                  setPasscodeError("");
                  setPasscodeSuccessMsg("");
                  setPasscodeCurrent("");
                  setPasscodeNew("");
                  setPasscodeConfirm("");
                  setIsPasscodeModalOpen(true);
                }}
                className="py-2.5 px-4 bg-white hover:bg-[#111111] hover:text-white text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] transition-all"
                title="Update Store Access Passcode"
              >
                <KeyRound className="w-4 h-4 text-[#005F73]" />
                <span>Change Passcode</span>
              </button>
            )}

            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="py-2.5 px-4 bg-[#FFB703] hover:bg-[#111111] hover:text-white text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Link Store</span>
            </button>

            <button
              onClick={handleVendorLogout}
              className="py-2.5 px-4 bg-[#D62828] hover:bg-[#111111] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] transition-all"
              title="Logout of Vendor Session"
            >
              <LogOut className="w-4 h-4 text-[#FFB703]" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Vendor Selector Dropdown Bar */}
        <div className="bg-[#111111] text-white p-4 border-4 border-[#111111] shadow-[6px_6px_0px_#FFB703] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-[#FFB703]" />
            <div>
              <span className="text-[10px] text-gray-300 font-bold uppercase block">Authenticated Vendor Store View</span>
              <span className="text-sm font-black uppercase text-[#FFB703]">
                {selectedMerchantId === "ALL" ? "All Marketplace Vendors (Aggregated View)" : activeMerchantInfo?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-black uppercase whitespace-nowrap text-gray-300">Active View:</label>
            <select
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              className="px-3 py-2 bg-white text-[#111111] border-2 border-[#111111] font-mono text-xs font-black uppercase focus:outline-none focus:ring-2 focus:ring-[#FFB703] w-full sm:w-64"
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

        {/* Selected Vendor Profile Details */}
        {activeMerchantInfo && (
          <div className="bg-white border-2 border-[#111111] p-4 shadow-[4px_4px_0px_#111111] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              {activeMerchantInfo.storeLogo && (
                <img
                  src={activeMerchantInfo.storeLogo}
                  alt={activeMerchantInfo.name}
                  className="w-10 h-10 object-cover border-2 border-[#111111]"
                />
              )}
              <div>
                <h3 className="font-black text-sm text-[#111111] uppercase">{activeMerchantInfo.name}</h3>
                <p className="text-[11px] text-[#005F73] font-bold">{activeMerchantInfo.myshopifyDomain}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-700 font-semibold">
              <div>
                <span className="text-[9px] uppercase block text-gray-500">Status</span>
                <span className="font-black text-emerald-700">{activeMerchantInfo.status}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase block text-gray-500">Connected Since</span>
                <span className="font-black text-[#111111]">{activeMerchantInfo.connectedSince || "Recently"}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase block text-gray-500">Sync Status</span>
                <span className="font-black text-[#005F73]">{activeMerchantInfo.lastWebhookSync || "Live Sync"}</span>
              </div>
            </div>

            <a
              href={`https://${activeMerchantInfo.myshopifyDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#FFB703] hover:bg-[#111111] hover:text-white border border-[#111111] font-black flex items-center gap-1.5 transition-colors"
            >
              <span>Visit Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* METRICS KPI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          
          {/* KPI 1: Estimated Catalog Value */}
          <div className="bg-white border-4 border-[#111111] p-4 shadow-[4px_4px_0px_#111111] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#005F73] uppercase tracking-wider">EST. CATALOG VALUE</span>
              <div className="p-1.5 bg-[#FFB703] border border-[#111111]">
                <DollarSign className="w-4 h-4 text-[#111111] stroke-[3]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111] font-mono">
              {formatCurrency(metrics.totalCatalogValue, "INR")}
            </div>
            <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.2% catalog value lift this month</span>
            </p>
          </div>

          {/* KPI 2: Total Listings */}
          <div className="bg-white border-4 border-[#111111] p-4 shadow-[4px_4px_0px_#111111] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#005F73] uppercase tracking-wider">ACTIVE PRODUCT LISTINGS</span>
              <div className="p-1.5 bg-[#005F73] text-white border border-[#111111]">
                <Package className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111] font-mono">
              {metrics.availableCount} / {metrics.totalListings} Live
            </div>
            <p className="text-[10px] text-[#2B2D42] font-bold">
              {metrics.totalListings - metrics.availableCount} reserved/sold out items
            </p>
          </div>

          {/* KPI 3: Product Categories */}
          <div className="bg-white border-4 border-[#111111] p-4 shadow-[4px_4px_0px_#111111] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#005F73] uppercase tracking-wider">PRODUCT CATEGORIES</span>
              <div className="p-1.5 bg-emerald-400 border border-[#111111]">
                <Layers className="w-4 h-4 text-[#111111] stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111] font-mono">
              {categories.length} Categories
            </div>
            <p className="text-[10px] text-[#2B2D42] font-bold">
              Spread across {metrics.totalListings} active catalog listings
            </p>
          </div>

          {/* KPI 4: Webhook Sync Health */}
          <div className="bg-white border-4 border-[#111111] p-4 shadow-[4px_4px_0px_#111111] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#005F73] uppercase tracking-wider">WEBHOOK SYNC HEALTH</span>
              <div className="p-1.5 bg-[#D62828] text-white border border-[#111111]">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#111111] font-mono flex items-center gap-2">
              <span>{metrics.syncHealthScore}%</span>
              <span className="text-xs px-2 py-0.5 bg-emerald-300 text-[#111111] border border-[#111111]">100% HEALTHY</span>
            </div>
            <p className="text-[10px] text-[#2B2D42] font-bold">
              {metrics.totalSyncLogsCount} synchronized events
            </p>
          </div>

        </div>

        {/* CATEGORY BREAKDOWN & METRICS INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Category Revenue & Share Distribution (Col-span-7) */}
          <div className="lg:col-span-7 bg-white border-4 border-[#111111] p-5 shadow-[6px_6px_0px_#111111] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <div className="flex items-center gap-2 font-mono">
                <Layers className="w-4 h-4 text-[#D62828]" />
                <h3 className="text-sm font-black uppercase text-[#111111]">Catalog Distribution by Category</h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#F4F4F0] px-2 py-1 border border-[#111111]">
                {categoryBreakdown.length} Categories
              </span>
            </div>

            <div className="space-y-3 font-mono">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-black uppercase">
                    <span className="text-[#111111]">{item.category}</span>
                    <span className="text-[#005F73]">
                      {item.count} items ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[#F4F4F0] border-2 border-[#111111] overflow-hidden">
                    <div
                      className="h-full bg-[#FFB703] border-r-2 border-[#111111]"
                      style={{ width: `${Math.max(5, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Shopify Catalog Integration Overview (Col-span-5) */}
          <div className="lg:col-span-5 bg-[#111111] text-white border-4 border-[#111111] p-5 shadow-[6px_6px_0px_#FFB703] flex flex-col justify-between space-y-4 font-mono">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FFB703]" />
                <span className="text-xs font-black uppercase text-[#FFB703]">Live Catalog Ingestion Engine</span>
              </div>
              <h3 className="text-lg font-black font-display uppercase tracking-tight text-white">
                Storefront Inventory & Product Drawer
              </h3>
              <p className="text-xs text-gray-300 font-semibold leading-relaxed">
                Click on any product card in the catalog table below to open the Product Specification Drawer. View multi-variant SKU pricing, direct Storefront GraphQL identifiers, and real-time webhook audit trails!
              </p>
            </div>

            <div className="p-3 bg-white/10 border border-white/20 text-[11px] font-semibold space-y-1">
              <div className="flex items-center gap-2 text-[#FFB703]">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-black uppercase">Active Capabilities</span>
              </div>
              <ul className="list-disc list-inside text-gray-300 text-[10px] space-y-1">
                <li>Real-Time Shopify Catalog Synchronization</li>
                <li>Multi-Variant SKU Pricing & Stock Inspector</li>
                <li>Direct WhatsApp B2B Inquiry Integration</li>
              </ul>
            </div>
          </div>

        </div>

        {/* VENDOR INVENTORY LISTING MANAGEMENT TABLE / GRID */}
        <div className="bg-white border-4 border-[#111111] p-6 shadow-[8px_8px_0px_#111111] space-y-6">
          
          {/* Section Header & Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-[#111111] pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono">
                <Package className="w-5 h-5 text-[#005F73]" />
                <h2 className="text-xl font-black font-display text-[#111111] uppercase tracking-tight">
                  Vendor Inventory Catalog ({filteredSlots.length})
                </h2>
              </div>
              <p className="text-xs font-mono text-[#2B2D42] font-semibold">
                Click any product to inspect specifications, SKU variants, and webhook audit logs.
              </p>
            </div>

            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto font-mono text-xs">
              
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F4F4F0] border-2 border-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-[#F4F4F0] border-2 border-[#111111] font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="px-3 py-2 bg-[#F4F4F0] border-2 border-[#111111] font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#FFB703]"
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
            <div className="overflow-x-auto border-2 border-[#111111]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#111111] text-white uppercase border-b-2 border-[#111111]">
                  <tr>
                    <th className="p-3">Product Info</th>
                    <th className="p-3">Vendor Store</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111] bg-white">
                  {filteredSlots.map((slot) => (
                    <tr
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className="hover:bg-[#FFB703]/10 cursor-pointer transition-colors group"
                    >
                      {/* Product Info */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {slot.images && slot.images[0] ? (
                            <img
                              src={slot.images[0]}
                              alt={slot.title}
                              className="w-12 h-12 object-cover border border-[#111111] shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#F4F4F0] border border-[#111111] flex items-center justify-center text-[9px] font-bold text-gray-500">
                              NO IMG
                            </div>
                          )}
                          <div>
                            <h4 className="font-black text-[#111111] group-hover:text-[#D62828] transition-colors line-clamp-1 uppercase">
                              {slot.title}
                            </h4>
                            <span className="text-[10px] text-gray-500">SKU: {slot.sku}</span>
                          </div>
                        </div>
                      </td>

                      {/* Vendor Store */}
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          {slot.merchant.storeLogo && (
                            <img src={slot.merchant.storeLogo} alt="logo" className="w-5 h-5 object-cover border border-[#111111]" />
                          )}
                          <span className="uppercase text-[#111111] font-bold">{slot.merchant.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-[#F4F4F0] border border-[#111111] font-bold text-[10px] uppercase">
                          {slot.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3 font-black text-[#D62828]">
                        {formatCurrency(slot.price, slot.currencyCode || "INR")}
                      </td>

                      {/* Stock Availability */}
                      <td className="p-3 font-black text-[#111111]">
                        {slot.inventoryQuantity <= 0 && !slot.isUnknownQuantity ? (
                          <span className="text-[#D62828] font-black">OUT OF STOCK</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">IN STOCK</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3">
                        {slot.status === "AVAILABLE" && (
                          <span className="px-2 py-0.5 bg-emerald-300 text-[#111111] border border-[#111111] font-black text-[10px] uppercase">
                            AVAILABLE
                          </span>
                        )}
                        {slot.status === "RESERVED" && (
                          <span className="px-2 py-0.5 bg-[#FFB703] text-[#111111] border border-[#111111] font-black text-[10px] uppercase">
                            RESERVED
                          </span>
                        )}
                        {slot.status === "SOLD" && (
                          <span className="px-2 py-0.5 bg-[#E5E5E0] text-[#111111] border border-[#111111] font-black text-[10px] uppercase">
                            SOLD OUT
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSlot(slot);
                          }}
                          className="px-3 py-1 bg-[#111111] hover:bg-[#D62828] text-white border border-[#111111] text-[11px] font-black uppercase inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#FFB703]" />
                          <span>Inspect Specs</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#F4F4F0] border-2 border-dashed border-[#111111] p-12 text-center space-y-3 font-mono">
              <Package className="w-8 h-8 text-[#005F73] mx-auto" />
              <h3 className="text-base font-black text-[#111111] uppercase">No Product Listings Found</h3>
              <p className="text-xs text-[#2B2D42]">
                Try updating your search query, clearing category filters, or selecting a different vendor store.
              </p>
            </div>
          )}

        </div>

      </main>

      {/* Footer Navigation Bar at the end of the page */}
      <footer className="bg-[#111111] text-white border-t-4 border-[#111111] py-6 px-4 mt-12 font-mono">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#FFB703] border border-white"></span>
            <span className="font-black uppercase text-[#FFB703]">MASTERS UNION VENDOR PORTAL</span>
          </div>

          <div className="flex items-center gap-4 font-bold">
            <Link href="/" className="hover:text-[#FFB703] transition-colors flex items-center gap-1">
              <span>← Public Marketplace</span>
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-[#FFB703] text-gray-300 transition-colors flex items-center gap-1">
              <span>🛡️ Admin Moderation Desk ↗</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Product Detail & Recommendation Drawer Popup */}
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

      {/* Change Store Passcode Modal */}
      {isPasscodeModalOpen && activeMerchantInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono">
          <div className="w-full max-w-md bg-white border-4 border-[#111111] p-6 shadow-[10px_10px_0px_#111111] space-y-5 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#D62828]" />
                <h3 className="font-black text-sm text-[#111111] uppercase tracking-wide">
                  Change Store Passcode
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(false)}
                className="p-1 hover:bg-[#111111] hover:text-white transition-colors text-zinc-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Store Information */}
            <div className="bg-[#F4F4F0] p-3 border-2 border-[#111111] text-xs space-y-1">
              <div className="flex justify-between font-bold text-zinc-600">
                <span>Active Store:</span>
                <span className="font-black text-[#111111]">{activeMerchantInfo.name}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-600">
                <span>Domain:</span>
                <span className="text-[#005F73] font-bold">{activeMerchantInfo.myshopifyDomain}</span>
              </div>
            </div>

            {/* Error & Success Messages */}
            {passcodeError && (
              <div className="p-3 bg-red-100 border-2 border-[#D62828] text-red-900 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D62828]" />
                <span>{passcodeError}</span>
              </div>
            )}

            {passcodeSuccessMsg && (
              <div className="p-3 bg-emerald-100 border-2 border-emerald-600 text-emerald-950 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{passcodeSuccessMsg}</span>
              </div>
            )}

            {/* Passcode Form */}
            <form onSubmit={handleUpdateStorePasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1">
                  1. Current Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current store passcode"
                  value={passcodeCurrent}
                  onChange={(e) => setPasscodeCurrent(e.target.value)}
                  className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3.5 py-2 text-xs text-[#111111] font-bold focus:outline-none focus:bg-white focus:border-[#FFB703]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1">
                  2. New Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min. 4 characters"
                  value={passcodeNew}
                  onChange={(e) => setPasscodeNew(e.target.value)}
                  className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3.5 py-2 text-xs text-[#111111] font-bold focus:outline-none focus:bg-white focus:border-[#FFB703]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#111111] uppercase tracking-wider mb-1">
                  3. Confirm New Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new passcode"
                  value={passcodeConfirm}
                  onChange={(e) => setPasscodeConfirm(e.target.value)}
                  className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3.5 py-2 text-xs text-[#111111] font-bold focus:outline-none focus:bg-white focus:border-[#FFB703]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasscodeModalOpen(false)}
                  className="px-4 py-2 border-2 border-[#111111] bg-[#F4F4F0] hover:bg-zinc-200 text-xs font-black uppercase text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passcodeSubmitting || !passcodeNew.trim()}
                  className="px-5 py-2 border-2 border-[#111111] bg-[#111111] hover:bg-[#D62828] text-white text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#FFB703] transition-all disabled:opacity-50"
                >
                  {passcodeSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 text-[#FFB703]" />
                      <span>Save New Passcode</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
