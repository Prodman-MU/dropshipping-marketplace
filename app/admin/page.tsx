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
  Trash2,
  Sliders,
  Globe,
  Save,
  RotateCcw,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
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
  deleteMerchantStore,
  resetMerchantPasscode,
} from "@/lib/store-manager";
import { ConnectStoreModal } from "@/components/ConnectStoreModal";
import {
  getSiteSettings,
  saveSiteSettings,
  resetSiteSettings,
  getActiveAdminPasscode,
  setAdminCustomPasscode,
  resetAdminPasscodeToDefault,
  DEFAULT_ENV_ADMIN_PASSCODE,
  SiteSettings,
  CarouselSlide,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/settings-manager";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [merchants, setMerchants] = useState<MerchantVendor[]>([]);
  const [slots, setSlots] = useState<SlotListing[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "REJECTED">("PENDING");
  const [expandedMerchantId, setExpandedMerchantId] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Admin Navigation Tab ("STORES" | "SETTINGS")
  const [adminTab, setAdminTab] = useState<"STORES" | "SETTINGS">("STORES");

  // Website Settings Form State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Admin Key Management State
  const [adminNewKey, setAdminNewKey] = useState("");
  const [adminConfirmKey, setAdminConfirmKey] = useState("");
  const [adminKeySuccess, setAdminKeySuccess] = useState("");
  const [adminKeyError, setAdminKeyError] = useState("");
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [vendorKeyToast, setVendorKeyToast] = useState<string | null>(null);

  // Load initial store state & site settings on mount, and hydrate live records from PostgreSQL
  useEffect(() => {
    setMerchants(getInitialMerchants());
    setSlots(getInitialSlots());
    setSiteSettings(getSiteSettings());

    if (typeof window !== "undefined") {
      const authSession = sessionStorage.getItem("admin_authenticated");
      if (authSession === "true") {
        setIsAuthenticated(true);
      }
    }

    // Fetch live database merchants and listings from server
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
        console.warn("Failed to load live database records in admin portal:", e);
      }
    };

    fetchLiveDbData();

    // Listen for cross-tab or component state updates
    const handleStateChange = () => {
      setMerchants(getInitialMerchants());
      setSlots(getInitialSlots());
    };
    const handleSettingsChange = () => {
      setSiteSettings(getSiteSettings());
    };

    window.addEventListener("store-state-changed", handleStateChange);
    window.addEventListener("site-settings-changed", handleSettingsChange);
    return () => {
      window.removeEventListener("store-state-changed", handleStateChange);
      window.removeEventListener("site-settings-changed", handleSettingsChange);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const activeAdminKey = getActiveAdminPasscode();
    const cleanInput = passcode.trim();
    if (cleanInput === activeAdminKey || cleanInput === DEFAULT_ENV_ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("admin_authenticated", "true");
    } else {
      setAuthError("Invalid Admin Access Key. Please try again.");
    }
  };

  const handleSaveAdminKey = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminKeyError("");
    setAdminKeySuccess("");

    if (adminNewKey.trim().length < 4) {
      setAdminKeyError("New Admin Passcode must be at least 4 characters.");
      return;
    }

    if (adminNewKey !== adminConfirmKey) {
      setAdminKeyError("Passcodes do not match.");
      return;
    }

    setAdminCustomPasscode(adminNewKey);
    setAdminKeySuccess(`✅ Admin Access Passcode updated! Current active key: "${adminNewKey.trim()}"`);
    setAdminNewKey("");
    setAdminConfirmKey("");
    setTimeout(() => setAdminKeySuccess(""), 4000);
  };

  const handleResetAdminKey = () => {
    if (
      confirm(
        `Reset Admin Passcode back to environment default ("${DEFAULT_ENV_ADMIN_PASSCODE}")?`
      )
    ) {
      resetAdminPasscodeToDefault();
      setAdminKeySuccess(`🔄 Admin Passcode reset to environment default ("${DEFAULT_ENV_ADMIN_PASSCODE}").`);
      setAdminKeyError("");
      setTimeout(() => setAdminKeySuccess(""), 4000);
    }
  };

  const handleResetVendorKey = async (merchantId: string) => {
    const target = merchants.find((m) => m.id === merchantId);
    if (!target) return;

    if (confirm(`Reset passcode for "${target.name}" to standard formula (<domain>123)?`)) {
      const { updatedMerchants, defaultPasscode } = resetMerchantPasscode(merchantId, merchants);
      setMerchants(updatedMerchants);

      try {
        await fetch("/api/auth/passcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reset_vendor_passcode",
            merchantId,
            domain: target.myshopifyDomain,
          }),
        });
      } catch (err) {
        console.warn("API reset sync error:", err);
      }

      setVendorKeyToast(`🔑 Passcode for "${target.name}" reset to "${defaultPasscode}".`);
      setTimeout(() => setVendorKeyToast(null), 4000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setPasscode("");
  };

  const handleApprove = async (merchantId: string) => {
    // 1. Optimistic local state update
    const { updatedMerchants, updatedSlots } = approveMerchantStore(merchantId, merchants, slots);
    setMerchants(updatedMerchants);
    setSlots(updatedSlots);

    // 2. Persist to PostgreSQL database
    try {
      const targetMerchant = merchants.find((m) => m.id === merchantId);
      await fetch("/api/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: merchantId,
          domain: targetMerchant?.myshopifyDomain,
          status: "ACTIVE",
        }),
      });
    } catch (err) {
      console.warn("DB update warning on merchant approval:", err);
    }
  };

  const handleReject = async (merchantId: string) => {
    // 1. Optimistic local state update
    const { updatedMerchants, updatedSlots } = rejectMerchantStore(merchantId, merchants, slots);
    setMerchants(updatedMerchants);
    setSlots(updatedSlots);

    // 2. Persist to PostgreSQL database
    try {
      const targetMerchant = merchants.find((m) => m.id === merchantId);
      await fetch("/api/merchants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: merchantId,
          domain: targetMerchant?.myshopifyDomain,
          status: "REJECTED",
        }),
      });
    } catch (err) {
      console.warn("DB update warning on merchant rejection:", err);
    }
  };

  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);
  const [syncNoticeToast, setSyncNoticeToast] = useState<string | null>(null);

  const handleSyncStore = async (domain: string, merchantId: string) => {
    setSyncingStoreId(merchantId);
    try {
      const res = await fetch("/api/shopify/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`Store sync failed: ${data.error || "Could not query store."}`);
        return;
      }

      // Refresh listings and merchants from DB
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

      setSyncNoticeToast(`✅ Catalog for "${domain}" updated live (${data.syncedSlotsCount} listings synced)!`);
      setTimeout(() => setSyncNoticeToast(null), 4000);
    } catch (e: any) {
      alert(`Sync error: ${e.message || "Failed to sync store."}`);
    } finally {
      setSyncingStoreId(null);
    }
  };

  const handleSyncAllStores = async () => {
    setIsSyncingAll(true);
    try {
      const res = await fetch("/api/cron/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`Sync all failed: ${data.error || "Could not sync all stores."}`);
        return;
      }

      // Refresh listings and merchants from DB
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

      setSyncNoticeToast(`✅ All active store catalogs synchronized live with Shopify!`);
      setTimeout(() => setSyncNoticeToast(null), 4000);
    } catch (e: any) {
      alert(`Sync all error: ${e.message || "Failed to sync."}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleDeleteStore = async (merchantId: string) => {
    if (confirm("Are you sure you want to permanently delete this store submission from the marketplace?")) {
      const targetMerchant = merchants.find((m) => m.id === merchantId);
      
      // Update local client state
      const { updatedMerchants, updatedSlots } = deleteMerchantStore(merchantId, merchants, slots);
      setMerchants(updatedMerchants);
      setSlots(updatedSlots);

      // Also invoke server API to cascade delete from PostgreSQL / Supabase tables
      try {
        const queryParam = targetMerchant?.myshopifyDomain
          ? `domain=${encodeURIComponent(targetMerchant.myshopifyDomain)}`
          : `id=${encodeURIComponent(merchantId)}`;
        await fetch(`/api/merchants?${queryParam}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Server database delete warning (store may be client-only mock):", err);
      }
    }
  };

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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteSettings(siteSettings);
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleResetSettings = () => {
    if (confirm("Reset all website settings and dropshipping year to factory defaults?")) {
      const defaults = resetSiteSettings();
      setSiteSettings(defaults);
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    }
  };

  const handleAddSlide = (type: "svg" | "image" | "video" | "image_ad" | "video_ad") => {
    const newSlide: CarouselSlide = {
      id: `slide-${Date.now()}`,
      type,
      badge: type === "svg" ? "MASTERS UNION PMC" : type === "video_ad" ? "FEATURED VIDEO AD" : type === "image_ad" ? "FEATURED DISPLAY AD" : type === "video" ? "FEATURED VIDEO" : "FEATURED SHOWCASE",
      title: type !== "svg" ? "NEW CAROUSEL SHOWCASE" : undefined,
      subtitle: type === "svg" ? "dropshipping 2026" : "Add custom description for this slide in Admin Portal.",
      mediaSrc: type.includes("video") ? "/assets/masters_union_dropshipping_v1.mp4" : type === "svg" ? undefined : "/assets/wp1959356-mob-psycho-100-wallpapers.jpg",
      ctaText: type !== "svg" ? "Explore Catalog" : undefined,
      ctaLink: type !== "svg" ? "#product-catalog" : undefined,
    };
    setSiteSettings((prev) => ({
      ...prev,
      carouselSlides: [...(prev.carouselSlides || []), newSlide],
    }));
  };

  const handleUpdateSlide = (id: string, updated: Partial<CarouselSlide>) => {
    setSiteSettings((prev) => ({
      ...prev,
      carouselSlides: (prev.carouselSlides || []).map((slide) =>
        slide.id === id ? { ...slide, ...updated } : slide
      ),
    }));
  };

  const handleDeleteSlide = (id: string) => {
    if ((siteSettings.carouselSlides || []).length <= 1) {
      alert("At least 1 slide is required in the carousel.");
      return;
    }
    if (confirm("Are you sure you want to delete this carousel slide slot from the marketplace hero?")) {
      setSiteSettings((prev) => ({
        ...prev,
        carouselSlides: (prev.carouselSlides || []).filter((slide) => slide.id !== id),
      }));
    }
  };

  const handleMoveSlideUp = (index: number) => {
    if (index <= 0) return;
    setSiteSettings((prev) => {
      const slides = [...(prev.carouselSlides || [])];
      const temp = slides[index];
      slides[index] = slides[index - 1];
      slides[index - 1] = temp;
      return { ...prev, carouselSlides: slides };
    });
  };

  const handleMoveSlideDown = (index: number) => {
    const slidesList = siteSettings.carouselSlides || [];
    if (index >= slidesList.length - 1) return;
    setSiteSettings((prev) => {
      const slides = [...(prev.carouselSlides || [])];
      const temp = slides[index];
      slides[index] = slides[index + 1];
      slides[index + 1] = temp;
      return { ...prev, carouselSlides: slides };
    });
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
                placeholder="Enter admin access passkey"
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-5">
          <div className="flex flex-wrap items-center justify-between h-auto py-3 sm:h-20 gap-4">
            
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
                  <span>Admin Control Portal</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-[#FFB703] text-[#111111] border border-[#111111]">
                    ACCESS CONTROLLED
                  </span>
                </h1>
                <p className="text-xs text-[#2B2D42] font-mono font-bold">
                  {adminTab === "STORES"
                    ? "Approve or Reject Shopify stores before items go live publicly"
                    : "Manage global website settings, branding & dropshipping year"}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setAdminTab("STORES")}
                className={`px-4 py-2 font-black flex items-center gap-2 border-2 border-[#111111] transition-all uppercase ${
                  adminTab === "STORES"
                    ? "bg-[#D62828] text-white shadow-[3px_3px_0px_#111111]"
                    : "bg-white text-[#111111] hover:bg-[#FFB703]"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Store Moderation</span>
              </button>

              <button
                onClick={() => setAdminTab("SETTINGS")}
                className={`px-4 py-2 font-black flex items-center gap-2 border-2 border-[#111111] transition-all uppercase ${
                  adminTab === "SETTINGS"
                    ? "bg-[#005F73] text-white shadow-[3px_3px_0px_#111111]"
                    : "bg-white text-[#111111] hover:bg-[#FFB703]"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Website Settings</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
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

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-5 py-8 space-y-8 relative z-10">
        
        {/* Vendor Key Updated Toast Banner */}
        {vendorKeyToast && (
          <div className="p-3.5 bg-[#FFB703] border-3 border-[#111111] shadow-[4px_4px_0px_#111111] font-mono text-xs font-black uppercase flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 stroke-[2.5]" />
              <span>{vendorKeyToast}</span>
            </div>
            <button
              onClick={() => setVendorKeyToast(null)}
              className="p-1 hover:bg-[#111111] hover:text-[#FFB703] transition-colors font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sync Success Toast Banner */}
        {syncNoticeToast && (
          <div className="p-3.5 bg-emerald-300 border-3 border-[#111111] shadow-[4px_4px_0px_#111111] font-mono text-xs font-black uppercase flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-950 shrink-0" />
              <span>{syncNoticeToast}</span>
            </div>
            <button
              onClick={() => setSyncNoticeToast(null)}
              className="p-1 hover:bg-[#111111] hover:text-white transition-colors font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: STORE MODERATION DASHBOARD */}
        {adminTab === "STORES" && (
          <>
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

            {/* Status Filter Tabs & Link Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs border-b-2 border-[#111111] pb-4">
              <div className="flex flex-wrap items-center gap-2">
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

              <div className="flex items-center gap-2">
                {/* Sync All Stores Catalog Action */}
                <button
                  onClick={handleSyncAllStores}
                  disabled={isSyncingAll}
                  className="px-4 py-2 bg-[#005F73] hover:bg-[#111111] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#111111] uppercase transition-all disabled:opacity-60"
                  title="Daily live sync: Pulls latest products from all active Shopify stores"
                >
                  <RefreshCw className={`w-4 h-4 text-[#FFB703] ${isSyncingAll ? "animate-spin" : ""}`} />
                  <span>{isSyncingAll ? "Syncing All..." : "Sync All Catalogs"}</span>
                </button>

                <button
                  onClick={() => setIsConnectModalOpen(true)}
                  className="px-4 py-2 bg-[#FFB703] text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_#111111] uppercase"
                >
                  <Store className="w-4 h-4 text-[#111111]" />
                  <span>Link Store</span>
                </button>
              </div>
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

                            {/* Store Passcode Status & Reset */}
                            <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-dashed border-zinc-300">
                              <span className="text-[11px] font-mono text-zinc-600 font-bold flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 text-[#005F73]" />
                                <span>Vendor Passcode:</span>
                                <code className="bg-[#F4F4F0] px-2 py-0.5 border border-[#111111] text-[#111111] font-black">
                                  {merchant.passcode || `${merchant.myshopifyDomain.split(".")[0].toLowerCase()}123`}
                                </code>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleResetVendorKey(merchant.id)}
                                className="text-[10px] font-mono font-black text-[#005F73] hover:text-[#D62828] hover:underline flex items-center gap-1 uppercase"
                                title="Reset passcode to default formula (<domain>123)"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset Passcode</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Approve / Reject / Sync Controls */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Sync Store Catalog Action */}
                          <button
                            onClick={() => handleSyncStore(merchant.myshopifyDomain, merchant.id)}
                            disabled={syncingStoreId === merchant.id}
                            className="px-3.5 py-2.5 bg-white hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] font-mono text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] transition-all uppercase disabled:opacity-60"
                            title="Query Shopify store and pull latest catalog listings"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 text-[#005F73] ${syncingStoreId === merchant.id ? "animate-spin" : ""}`} />
                            <span>{syncingStoreId === merchant.id ? "Syncing..." : "Refresh Catalog"}</span>
                          </button>

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

                          {/* Delete Button for Rejected Stores */}
                          {merchant.status === "REJECTED" && (
                            <button
                              onClick={() => handleDeleteStore(merchant.id)}
                              className="px-4 py-2.5 bg-[#111111] hover:bg-[#D62828] text-white border-2 border-[#111111] bauhaus-btn font-mono text-xs font-black flex items-center gap-2 uppercase transition-all shadow-[2px_2px_0px_#D62828]"
                              title="Permanently remove rejected store from marketplace"
                            >
                              <Trash2 className="w-4 h-4 text-[#FFB703]" />
                              <span>Delete Rejected Store</span>
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
                                       <span className="text-xs font-black text-[#005F73]">
                                         SKU: {slot.sku}
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
                                       {(!slot.isUnknownQuantity && slot.inventoryQuantity <= 0) && (
                                         <span className="text-[#D62828] font-black">• Out of Stock</span>
                                       )}
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
          </>
        )}

        {/* TAB 2: WEBSITE SETTINGS */}
        {adminTab === "SETTINGS" && (
          <div className="space-y-8">
            
            {/* Confirmation Toast */}
            {settingsSaveSuccess && (
              <div className="p-4 bg-[#005F73] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-between font-mono text-xs font-bold animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#FFB703]" />
                  <span>Website Settings & Dropshipping Year updated successfully! Live across all pages.</span>
                </div>
                <span className="text-[10px] bg-[#111111] text-[#FFB703] px-2 py-1 font-black">SAVED & SYNCED</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Card */}
              <div className="lg:col-span-7 bg-white border-4 border-[#111111] p-6 sm:p-8 shadow-[8px_8px_0px_#111111] space-y-6">
                
                <div className="border-b-2 border-[#111111] pb-4">
                  <h2 className="text-xl font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#D62828]" />
                    <span>Global Website Settings</span>
                  </h2>
                  <p className="text-xs text-[#2B2D42] font-mono font-bold mt-1">
                    Edit dropshipping year, marketplace branding, and banner labels displayed on the website UI.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5 font-mono">
                  
                  {/* Dropshipping Year Input */}
                  <div className="p-4 bg-[#F4F4F0] border-2 border-[#111111] space-y-2 shadow-[3px_3px_0px_#111111]">
                    <label className="block text-xs font-black text-[#111111] uppercase tracking-wider flex items-center justify-between">
                      <span>Dropshipping Year</span>
                      <span className="px-2 py-0.5 text-[10px] bg-[#FFB703] text-[#111111] font-black border border-[#111111]">EDITABLE PARAMETER</span>
                    </label>
                    <input
                      type="text"
                      value={siteSettings.dropshippingYear}
                      onChange={(e) => setSiteSettings({ ...siteSettings, dropshippingYear: e.target.value })}
                      required
                      placeholder="e.g. 2026 or 2027"
                      className="w-full bg-white border-2 border-[#111111] px-4 py-2.5 text-base font-black text-[#D62828] focus:outline-none focus:border-[#FFB703]"
                    />
                    <p className="text-[11px] text-[#2B2D42] font-bold">
                      Updates the year displayed in Header logo, Hero badge, Background Video label, and Footer copyright.
                    </p>
                  </div>

                  {/* Site Title Input */}
                  <div className="p-4 bg-[#F4F4F0] border-2 border-[#111111] space-y-2 shadow-[3px_3px_0px_#111111]">
                    <label className="block text-xs font-black text-[#111111] uppercase tracking-wider">
                      Marketplace Organization Title
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteTitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                      required
                      placeholder="e.g. MASTERS UNION"
                      className="w-full bg-white border-2 border-[#111111] px-4 py-2.5 text-sm font-bold text-[#111111] focus:outline-none focus:border-[#FFB703]"
                    />
                    <p className="text-[11px] text-[#2B2D42] font-bold">
                      Used in header text fallback and footer copyright notice.
                    </p>
                  </div>

                  {/* Hero Announcement Text */}
                  <div className="p-4 bg-[#F4F4F0] border-2 border-[#111111] space-y-2 shadow-[3px_3px_0px_#111111]">
                    <label className="block text-xs font-black text-[#111111] uppercase tracking-wider">
                      Hero Banner Subtitle / Announcement
                    </label>
                    <input
                      type="text"
                      value={siteSettings.announcementText}
                      onChange={(e) => setSiteSettings({ ...siteSettings, announcementText: e.target.value })}
                      required
                      placeholder="e.g. MASTERS UNION PMC — STUDENT-CURATED DROPSHIPPING NETWORK"
                      className="w-full bg-white border-2 border-[#111111] px-4 py-2.5 text-sm font-bold text-[#111111] focus:outline-none focus:border-[#FFB703]"
                    />
                    <p className="text-[11px] text-[#2B2D42] font-bold">
                      Displays in the top ticker bar above the hero video.
                    </p>
                  </div>

                  {/* Catalog Badge Text */}
                  <div className="p-4 bg-[#F4F4F0] border-2 border-[#111111] space-y-2 shadow-[3px_3px_0px_#111111]">
                    <label className="block text-xs font-black text-[#111111] uppercase tracking-wider">
                      Catalog Badge Text
                    </label>
                    <input
                      type="text"
                      value={siteSettings.catalogBadgeText}
                      onChange={(e) => setSiteSettings({ ...siteSettings, catalogBadgeText: e.target.value })}
                      required
                      placeholder="e.g. OFFICIAL CATALOG"
                      className="w-full bg-white border-2 border-[#111111] px-4 py-2.5 text-sm font-bold text-[#111111] focus:outline-none focus:border-[#FFB703]"
                    />
                    <p className="text-[11px] text-[#2B2D42] font-bold">
                      Appears alongside the dropshipping year in the hero yellow badge.
                    </p>
                  </div>

                  {/* Hero Carousel Manager */}
                  <div className="p-4 bg-[#F4F4F0] border-2 border-[#111111] space-y-4 shadow-[3px_3px_0px_#111111]">
                    <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
                      <div>
                        <label className="block text-xs font-black text-[#111111] uppercase tracking-wider">
                          Hero Carousel Slots ({siteSettings.carouselSlides?.length || 0} Slots Active)
                        </label>
                        <p className="text-[11px] text-[#2B2D42] font-bold mt-0.5">
                          Add or remove slots. The homepage carousel automatically rotates through all filled slots every 5.6s.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddSlide("image_ad")}
                          className="px-2.5 py-1 bg-[#D62828] text-white border border-[#111111] font-mono text-[10px] font-black uppercase hover:bg-[#111111] transition-colors"
                        >
                          + Add Full Image Ad
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("video_ad")}
                          className="px-2.5 py-1 bg-[#005F73] text-white border border-[#111111] font-mono text-[10px] font-black uppercase hover:bg-[#111111] transition-colors"
                        >
                          + Add Full Video Ad
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("image")}
                          className="px-2.5 py-1 bg-[#FFB703] text-[#111111] border border-[#111111] font-mono text-[10px] font-black uppercase hover:bg-[#111111] hover:text-[#FFB703] transition-colors"
                        >
                          + Add Text+Image
                        </button>
                      </div>
                    </div>

                    {/* Slides List */}
                    <div className="space-y-4 pt-1">
                      {(siteSettings.carouselSlides || []).map((slide, idx) => (
                        <div
                          key={slide.id}
                          className="p-3.5 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-3 font-mono text-xs"
                        >
                          <div className="flex items-center justify-between font-black text-[#111111] border-b border-[#111111] pb-2">
                            <span className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-[#D62828] text-white text-[10px]">
                                SLOT #{idx + 1} ({slide.type.toUpperCase()})
                              </span>
                              <span className="text-[#005F73]">{slide.badge}</span>
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveSlideUp(idx)}
                                disabled={idx === 0}
                                className="p-1 bg-[#E5E5E0] hover:bg-[#FFB703] disabled:opacity-30 disabled:hover:bg-[#E5E5E0] text-[#111111] border border-[#111111] transition-colors"
                                title="Move slide up"
                              >
                                <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMoveSlideDown(idx)}
                                disabled={idx === (siteSettings.carouselSlides || []).length - 1}
                                className="p-1 bg-[#E5E5E0] hover:bg-[#FFB703] disabled:opacity-30 disabled:hover:bg-[#E5E5E0] text-[#111111] border border-[#111111] transition-colors"
                                title="Move slide down"
                              >
                                <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSlide(slide.id)}
                                className="p-1 text-[#D62828] hover:bg-[#D62828] hover:text-white border border-[#111111] transition-colors ml-1"
                                title="Delete this carousel slide"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-[#2B2D42] uppercase mb-1">Badge Label</label>
                              <input
                                type="text"
                                value={slide.badge}
                                onChange={(e) => handleUpdateSlide(slide.id, { badge: e.target.value })}
                                className="w-full bg-[#F4F4F0] border border-[#111111] px-2.5 py-1 text-xs font-bold text-[#111111]"
                              />
                            </div>

                            {slide.type !== "svg" && (
                              <div>
                                <label className="block text-[10px] font-bold text-[#2B2D42] uppercase mb-1">Slide Title</label>
                                <input
                                  type="text"
                                  value={slide.title || ""}
                                  onChange={(e) => handleUpdateSlide(slide.id, { title: e.target.value })}
                                  placeholder="Slide Headline"
                                  className="w-full bg-[#F4F4F0] border border-[#111111] px-2.5 py-1 text-xs font-bold text-[#111111]"
                                />
                              </div>
                            )}

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-[#2B2D42] uppercase mb-1">Subtitle / Description</label>
                              <input
                                type="text"
                                value={slide.subtitle || ""}
                                onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                                placeholder="Subtitle text..."
                                className="w-full bg-[#F4F4F0] border border-[#111111] px-2.5 py-1 text-xs font-bold text-[#111111]"
                              />
                            </div>

                            {slide.type !== "svg" && (
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-[#2B2D42] uppercase mb-1">
                                  {slide.type === "video" ? "Video URL / Path (.mp4)" : "Image URL / Asset Path"}
                                </label>
                                <input
                                  type="text"
                                  value={slide.mediaSrc || ""}
                                  onChange={(e) => handleUpdateSlide(slide.id, { mediaSrc: e.target.value })}
                                  placeholder={slide.type === "video" ? "/assets/masters_union_dropshipping_v1.mp4" : "/assets/wp1959356-mob-psycho-100-wallpapers.jpg"}
                                  className="w-full bg-[#F4F4F0] border border-[#111111] px-2.5 py-1 text-xs font-bold text-[#111111]"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-[#005F73] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#111111]"
                    >
                      <Save className="w-4 h-4 text-[#FFB703]" />
                      <span>Save Website Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSettings}
                      className="px-4 py-3.5 bg-[#E5E5E0] text-[#111111] border-2 border-[#111111] font-mono text-xs font-black uppercase hover:bg-[#D62828] hover:text-white transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>

                </form>

              </div>

              {/* Live UI Preview & Admin Security Boxes */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Admin Security & Access Passcode Card */}
                <div className="bg-white border-4 border-[#111111] p-6 shadow-[8px_8px_0px_#111111] space-y-5 font-mono">
                  <div className="border-b-2 border-[#111111] pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#D62828]" />
                      <span>Admin Passcode Security</span>
                    </h3>
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-black border border-[#111111] ${
                      siteSettings.adminCustomPasscode ? "bg-[#FFB703] text-[#111111]" : "bg-zinc-100 text-zinc-700"
                    }`}>
                      {siteSettings.adminCustomPasscode ? "CUSTOM KEY ACTIVE" : "DEFAULT KEY ACTIVE"}
                    </span>
                  </div>

                  {/* Status Banner */}
                  <div className="p-3 bg-[#F4F4F0] border-2 border-[#111111] text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-zinc-600">
                      <span>Active Passcode:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="bg-white px-2 py-0.5 border border-[#111111] font-black text-[#111111]">
                          {showAdminKey ? getActiveAdminPasscode() : "••••••••"}
                        </code>
                        <button
                          type="button"
                          onClick={() => setShowAdminKey(!showAdminKey)}
                          className="p-1 text-zinc-500 hover:text-black"
                          title={showAdminKey ? "Hide passcode" : "Show passcode"}
                        >
                          {showAdminKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                      <span>Environment Default:</span>
                      <code>{DEFAULT_ENV_ADMIN_PASSCODE}</code>
                    </div>
                  </div>

                  {/* Success / Error alerts */}
                  {adminKeySuccess && (
                    <div className="p-3 bg-emerald-100 border-2 border-emerald-600 text-emerald-950 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{adminKeySuccess}</span>
                    </div>
                  )}

                  {adminKeyError && (
                    <div className="p-3 bg-red-100 border-2 border-[#D62828] text-red-900 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#D62828] shrink-0" />
                      <span>{adminKeyError}</span>
                    </div>
                  )}

                  {/* Update Form */}
                  <form onSubmit={handleSaveAdminKey} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-black text-[#111111] uppercase tracking-wider mb-1">
                        New Admin Passcode
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Min. 4 characters"
                        value={adminNewKey}
                        onChange={(e) => setAdminNewKey(e.target.value)}
                        className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:bg-white focus:border-[#FFB703]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-[#111111] uppercase tracking-wider mb-1">
                        Confirm New Passcode
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new passcode"
                        value={adminConfirmKey}
                        onChange={(e) => setAdminConfirmKey(e.target.value)}
                        className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-3 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:bg-white focus:border-[#FFB703]"
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleResetAdminKey}
                        className="px-3 py-2 bg-[#E5E5E0] hover:bg-zinc-300 text-[#111111] border-2 border-[#111111] text-[11px] font-black uppercase flex items-center gap-1.5 transition-colors"
                        title="Reset passcode back to .env default"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to .env</span>
                      </button>

                      <button
                        type="submit"
                        disabled={!adminNewKey.trim()}
                        className="px-4 py-2 bg-[#111111] hover:bg-[#005F73] text-white border-2 border-[#111111] text-[11px] font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#FFB703] transition-all disabled:opacity-50"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#FFB703]" />
                        <span>Save Key</span>
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-white border-4 border-[#111111] p-6 shadow-[8px_8px_0px_#111111] space-y-4">
                  <div className="border-b-2 border-[#111111] pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#111111] font-display uppercase tracking-tight flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#005F73]" />
                      <span>Real-time UI Preview</span>
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-[#FFB703] text-[#111111] border border-[#111111]">
                      LIVE PERSPECTIVE
                    </span>
                  </div>

                  {/* Header Badge Preview */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-black text-[#2B2D42] uppercase">1. Header Logo & Year</span>
                    <div className="p-3 bg-[#111111] border-2 border-[#111111] flex items-center justify-between text-[#FFB703] font-mono text-xs font-black">
                      <span>MU DROPSHIPPING</span>
                      <span className="bg-[#FFB703] text-[#111111] px-2 py-0.5 border border-[#111111]">
                        / DROPSHIPPING {siteSettings.dropshippingYear}
                      </span>
                    </div>
                  </div>

                  {/* Hero Badge Preview */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-black text-[#2B2D42] uppercase">2. Hero Catalog Badge</span>
                    <div className="p-3 bg-[#F4F4F0] border-2 border-[#111111] flex items-center justify-between font-mono text-xs">
                      <span className="font-black text-[#111111] uppercase truncate max-w-[180px]">{siteSettings.announcementText}</span>
                      <span className="bg-[#FFB703] text-[#111111] font-black px-2.5 py-1 border border-[#111111] shrink-0 ml-2">
                        {siteSettings.dropshippingYear} {siteSettings.catalogBadgeText}
                      </span>
                    </div>
                  </div>

                  {/* Hero Video Banner Preview */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-black text-[#2B2D42] uppercase">3. Video Banner Controls</span>
                    <div className="p-3 bg-[#111111] border-2 border-[#111111] flex items-center justify-between text-white font-mono text-xs font-black">
                      <span className="flex items-center gap-1.5 text-[#FFB703]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>HERO VIDEO {siteSettings.dropshippingYear}</span>
                      </span>
                      <span className="px-2 py-0.5 bg-[#FFB703] text-[#111111] text-[10px] uppercase font-black">TOGGLE ON</span>
                    </div>
                  </div>

                  {/* Footer Copyright Preview */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-black text-[#2B2D42] uppercase">4. Footer Copyright</span>
                    <div className="p-3 bg-[#111111] border-2 border-[#111111] text-center font-mono text-[11px] text-gray-300">
                      © {siteSettings.dropshippingYear} {siteSettings.siteTitle} // BUILT BY THE PRODUCT MANAGEMENT CLUB.
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

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
