/**
 * @file page.tsx (under app/admin/)
 * @description Apple Store Minimalist Admin Control Desk & Moderation Portal.
 * 
 * Features:
 * - Pure white canvas with generous spacing and frosted glass header
 * - Clean pill navigation tabs for Store Moderation and Website Settings
 * - Minimalist metric cards and store approval controls
 * - Dynamic Carousel customizer and Admin Key security management
 */

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
  X,
  Mail,
  Loader2,
  Check,
  Send,
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

  // Admin Passcode Reset via Email Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"REQUEST" | "VERIFY">("REQUEST");
  const [resetMaskedEmail, setResetMaskedEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPasscode, setResetNewPasscode] = useState("");
  const [resetConfirmPasscode, setResetConfirmPasscode] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

    const fetchLiveDbData = async () => {
      try {
        const [mRes, lRes, pRes] = await Promise.all([
          fetch("/api/merchants").then((r) => r.json()).catch(() => null),
          fetch("/api/listings").then((r) => r.json()).catch(() => null),
          fetch("/api/auth/passcode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get_admin_default" }),
          }).then((r) => r.json()).catch(() => null),
        ]);

        if (pRes?.activeDbPasscode) {
          setAdminCustomPasscode(pRes.activeDbPasscode);
        }

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

  const handleSendOtp = async () => {
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResetError(data.error || "Failed to dispatch verification code.");
      } else {
        setResetMaskedEmail(data.maskedEmail || "admin email");
        setResetStep("VERIFY");
        setResendCooldown(60);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error sending OTP.";
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (resetOtp.trim().length !== 6) {
      setResetError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (resetNewPasscode.trim().length < 4) {
      setResetError("New passcode must be at least 4 characters long.");
      return;
    }
    if (resetNewPasscode !== resetConfirmPasscode) {
      setResetError("Passcodes do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: resetOtp.trim(),
          newPasscode: resetNewPasscode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResetError(data.error || "Failed to verify OTP.");
      } else {
        setAdminCustomPasscode(resetNewPasscode.trim());
        setResetSuccess("Admin passcode reset successfully! Logging you in...");
        setTimeout(() => {
          setIsResetModalOpen(false);
          setIsAuthenticated(true);
          sessionStorage.setItem("admin_authenticated", "true");
          setPasscode(resetNewPasscode.trim());
          setResetOtp("");
          setResetNewPasscode("");
          setResetConfirmPasscode("");
          setResetStep("REQUEST");
          setResetSuccess("");
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error verifying OTP.";
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

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
    setAdminKeySuccess(`Admin Access Passcode updated!`);
    setAdminNewKey("");
    setAdminConfirmKey("");
    setTimeout(() => setAdminKeySuccess(""), 4000);
  };

  const handleResetAdminKey = () => {
    if (confirm(`Reset Admin Passcode back to environment default ("${DEFAULT_ENV_ADMIN_PASSCODE}")?`)) {
      resetAdminPasscodeToDefault();
      setAdminKeySuccess(`Admin Passcode reset to environment default.`);
      setAdminKeyError("");
      setTimeout(() => setAdminKeySuccess(""), 4000);
    }
  };

  const handleResetVendorKey = async (merchantId: string) => {
    const target = merchants.find((m) => m.id === merchantId);
    if (!target) return;

    if (confirm(`Reset passcode for "${target.name}" to default standard formula (<domain>123)?`)) {
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

      setVendorKeyToast(`Passcode for "${target.name}" reset to "${defaultPasscode}".`);
      setTimeout(() => setVendorKeyToast(null), 4000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setPasscode("");
  };

  const handleApprove = async (merchantId: string) => {
    const { updatedMerchants, updatedSlots } = approveMerchantStore(merchantId, merchants, slots);
    setMerchants(updatedMerchants);
    setSlots(updatedSlots);

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
    const { updatedMerchants, updatedSlots } = rejectMerchantStore(merchantId, merchants, slots);
    setMerchants(updatedMerchants);
    setSlots(updatedSlots);

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

      setSyncNoticeToast(`Catalog for "${domain}" updated live (${data.syncedSlotsCount} listings synced)!`);
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

      setSyncNoticeToast(`All active store catalogs synchronized live with Shopify!`);
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
      
      const { updatedMerchants, updatedSlots } = deleteMerchantStore(merchantId, merchants, slots);
      setMerchants(updatedMerchants);
      setSlots(updatedSlots);

      try {
        const queryParam = targetMerchant?.myshopifyDomain
          ? `domain=${encodeURIComponent(targetMerchant.myshopifyDomain)}`
          : `id=${encodeURIComponent(merchantId)}`;
        await fetch(`/api/merchants?${queryParam}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Server database delete warning:", err);
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
      badge: type === "svg" ? "CURATED DROP" : type === "video_ad" ? "FEATURED VIDEO" : type === "image_ad" ? "FEATURED COLLECTION" : "EDITORIAL SELECTION",
      title: type !== "svg" ? "NEW CURATED SHOWCASE" : undefined,
      subtitle: type === "svg" ? "dropshipping 2026" : "Add custom description for this slide in Admin Portal.",
      mediaSrc: type.includes("video") ? "/assets/masters_union_dropshipping_v1.mp4" : type === "svg" ? undefined : "/assets/wp1959356-mob-psycho-100-wallpapers.jpg",
      ctaText: type !== "svg" ? "Explore Collection" : undefined,
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
      <div className="min-h-screen bg-white text-[#111111] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-10 shadow-xl space-y-6 text-center">
          
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-800">
            <Lock className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest block">
              ACCESS CONTROL
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl text-neutral-950 font-normal">
              Admin Moderation
            </h1>
            <p className="text-xs text-neutral-600">
              Protected portal for Shopify supplier moderation and marketplace settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Admin Passkey
              </label>
              <input
                type="password"
                placeholder="Enter access passkey"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
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
              className="pill-btn-primary w-full py-3.5 text-xs font-semibold tracking-wider uppercase cursor-pointer"
            >
              Authenticate & Enter Desk
            </button>

            {/* Forgot Passcode / Reset via Email Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsResetModalOpen(true);
                  setResetStep("REQUEST");
                  setResetError("");
                  setResetSuccess("");
                  setResetOtp("");
                  setResetNewPasscode("");
                  setResetConfirmPasscode("");
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-neutral-200/90 hover:border-neutral-400 bg-neutral-50/70 hover:bg-neutral-100/80 text-xs font-medium text-neutral-700 hover:text-black flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>Forgot Passcode? Reset via Email</span>
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-neutral-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-black transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Marketplace</span>
            </Link>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* ADMIN PASSCODE RESET VIA EMAIL OTP MODAL                             */}
        {/* ==================================================================== */}
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 text-left">
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black transition cursor-pointer"
                title="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 font-mono text-[10px] font-semibold tracking-wider uppercase mb-1">
                  <Mail className="w-3 h-3" />
                  <span>Email Verification</span>
                </div>
                <h3 className="font-editorial text-2xl text-neutral-950 font-normal">
                  Reset Admin Passcode
                </h3>
                <p className="text-xs text-neutral-600">
                  {resetStep === "REQUEST"
                    ? "We will send a 6-digit one-time verification code to the registered Administrator email address."
                    : `Enter the 6-digit code sent to ${resetMaskedEmail} to establish your new passcode.`}
                </p>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {/* STEP 1: REQUEST OTP */}
              {resetStep === "REQUEST" && (
                <div className="space-y-4 pt-1">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70 space-y-1 text-xs text-neutral-600">
                    <p className="font-medium text-neutral-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Zero-Trust Security</span>
                    </p>
                    <p>The verification code expires in 10 minutes. Only the server administrator receives this notification.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resetLoading}
                    className="pill-btn-primary w-full py-3.5 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send 6-Digit Code</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* STEP 2: VERIFY OTP & SET NEW PASSCODE */}
              {resetStep === "VERIFY" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 849201"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-center font-mono text-lg tracking-widest text-neutral-900 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        New Admin Passcode
                      </label>
                      <input
                        type="password"
                        placeholder="At least 4 characters"
                        value={resetNewPasscode}
                        onChange={(e) => setResetNewPasscode(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Confirm Passcode
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter new passcode"
                        value={resetConfirmPasscode}
                        onChange={(e) => setResetConfirmPasscode(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs font-mono text-neutral-900 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="pill-btn-primary w-full py-3.5 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying & Resetting...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Reset & Authenticate</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resetLoading || resendCooldown > 0}
                        className="text-neutral-500 hover:text-black font-medium transition cursor-pointer disabled:opacity-50"
                      >
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Code"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setResetStep("REQUEST");
                          setResetError("");
                        }}
                        className="text-neutral-500 hover:text-black transition"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col font-sans">
      
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full glass-header transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-9 h-9 rounded-full border border-neutral-200/80 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-800 hover:text-black transition shadow-xs"
                title="Return to Public Website"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2]" />
              </Link>
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-neutral-950 flex items-center gap-2">
                  <span>Admin Desk</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600">
                    PROTECTED
                  </span>
                </h1>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-neutral-100">
              <button
                type="button"
                onClick={() => setAdminTab("STORES")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  adminTab === "STORES"
                    ? "bg-white text-black shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Store Moderation</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab("SETTINGS")}
                className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  adminTab === "SETTINGS"
                    ? "bg-white text-black shadow-xs"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Website Settings</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="pill-btn-secondary px-3.5 py-1.5 text-xs font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Toast Banners */}
        {vendorKeyToast && (
          <div className="p-3.5 rounded-2xl bg-neutral-900 text-white text-xs font-mono flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>{vendorKeyToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setVendorKeyToast(null)}
              className="text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {syncNoticeToast && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncNoticeToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncNoticeToast(null)}
              className="text-emerald-700 hover:text-emerald-950"
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
              <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 space-y-1">
                <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Pending Approval
                </span>
                <div className="text-2xl sm:text-3xl font-semibold text-neutral-950 flex items-center gap-2">
                  <span>{pendingCount}</span>
                  {pendingCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500">Requires admin review</p>
              </div>

              <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 space-y-1">
                <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Approved Stores
                </span>
                <div className="text-2xl sm:text-3xl font-semibold text-neutral-950">{activeCount}</div>
                <p className="text-[11px] text-neutral-500">Live on public marketplace</p>
              </div>

              <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 space-y-1">
                <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Rejected Stores
                </span>
                <div className="text-2xl sm:text-3xl font-semibold text-neutral-950">{rejectedCount}</div>
                <p className="text-[11px] text-neutral-500">Disabled integrations</p>
              </div>

              <div className="p-5 bg-[#F8F9FA] rounded-2xl border border-neutral-200/70 space-y-1">
                <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Total Linked Stores
                </span>
                <div className="text-2xl sm:text-3xl font-semibold text-neutral-950">{merchants.length}</div>
                <p className="text-[11px] text-neutral-500">Connected merchant accounts</p>
              </div>
            </div>

            {/* Status Filter Tabs & Link Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/70 pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "PENDING", label: "Pending Approval", count: pendingCount },
                  { id: "ACTIVE", label: "Active Stores", count: activeCount },
                  { id: "REJECTED", label: "Rejected Stores", count: rejectedCount },
                  { id: "ALL", label: "All Stores", count: merchants.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                      activeFilter === tab.id
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1.5 opacity-75">({tab.count})</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncAllStores}
                  disabled={isSyncingAll}
                  className="pill-btn-secondary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                  title="Daily live sync: Pulls latest products from all active Shopify stores"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin" : ""}`} />
                  <span>{isSyncingAll ? "Syncing All..." : "Sync All Catalogs"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(true)}
                  className="pill-btn-primary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Link Store</span>
                </button>
              </div>
            </div>

            {/* Stores List */}
            <div className="space-y-4">
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => {
                  const storeSlots = slots.filter((s) => s.merchant.id === merchant.id);
                  const isExpanded = expandedMerchantId === merchant.id || activeFilter === "PENDING";

                  return (
                    <div
                      key={merchant.id}
                      className="p-6 bg-white rounded-2xl border border-neutral-200/80 space-y-5 shadow-xs transition-all"
                    >
                      {/* Store Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl border border-neutral-200 overflow-hidden bg-[#F5F5F7] flex items-center justify-center shrink-0">
                            {merchant.storeLogo ? (
                              <img
                                src={merchant.storeLogo}
                                alt={merchant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-mono font-semibold text-xs text-neutral-600">
                                {merchant.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2.5">
                              <h2 className="text-base sm:text-lg font-semibold text-neutral-950">
                                {merchant.name}
                              </h2>
                              {merchant.status === "PENDING" && (
                                <span className="status-pill bg-amber-50 text-amber-800 border-amber-200">
                                  Pending Approval
                                </span>
                              )}
                              {merchant.status === "ACTIVE" && (
                                <span className="status-pill bg-emerald-50 text-emerald-800 border-emerald-200">
                                  Active
                                </span>
                              )}
                              {merchant.status === "REJECTED" && (
                                <span className="status-pill bg-red-50 text-red-800 border-red-200">
                                  Rejected
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-neutral-500">
                              <span>{merchant.myshopifyDomain}</span>
                              <span>•</span>
                              <span>{storeSlots.length} Synced Products</span>
                              <span>•</span>
                              <span>Connected: {merchant.connectedSince}</span>
                            </div>

                            {/* Passcode preview */}
                            <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                              <span className="text-neutral-500">
                                Vendor Passcode: <code className="px-1.5 py-0.5 rounded bg-neutral-100 font-semibold text-neutral-900">{merchant.passcode || `${merchant.myshopifyDomain.split(".")[0].toLowerCase()}123`}</code>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleResetVendorKey(merchant.id)}
                                className="text-[11px] text-neutral-500 hover:text-black underline flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Approve / Reject / Sync Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleSyncStore(merchant.myshopifyDomain, merchant.id)}
                            disabled={syncingStoreId === merchant.id}
                            className="pill-btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingStoreId === merchant.id ? "animate-spin" : ""}`} />
                            <span>{syncingStoreId === merchant.id ? "Syncing..." : "Refresh"}</span>
                          </button>

                          {merchant.status !== "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => handleApprove(merchant.id)}
                              className="pill-btn-primary bg-emerald-600 hover:bg-emerald-700 px-4 py-1.5 text-xs font-medium flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve Store</span>
                            </button>
                          )}

                          {merchant.status !== "REJECTED" && (
                            <button
                              type="button"
                              onClick={() => handleReject(merchant.id)}
                              className="pill-btn-secondary text-red-600 hover:bg-red-50 hover:border-red-300 px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          {merchant.status === "REJECTED" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteStore(merchant.id)}
                              className="pill-btn-secondary text-red-700 hover:bg-red-50 hover:border-red-300 px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5"
                              title="Permanently remove rejected store from marketplace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedMerchantId(expandedMerchantId === merchant.id ? null : merchant.id)
                            }
                            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition"
                            title="Toggle preview"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Preview */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-neutral-100 space-y-4">
                          <div className="flex items-center justify-between font-mono text-xs text-neutral-500">
                            <span>Synced Products ({storeSlots.length})</span>
                          </div>

                          {storeSlots.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {storeSlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="p-3 rounded-xl bg-[#F8F9FA] border border-neutral-200/60 flex gap-3 overflow-hidden"
                                >
                                  {slot.images && slot.images[0] && (
                                    <img
                                      src={slot.images[0]}
                                      alt={slot.title}
                                      className="w-16 h-16 rounded-lg object-cover bg-white shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1 space-y-0.5 font-mono text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-neutral-400 truncate max-w-[100px]">SKU: {slot.sku}</span>
                                      <span className="font-semibold text-neutral-900">{formatCurrency(slot.price, slot.currencyCode || "INR")}</span>
                                    </div>
                                    <h4 className="font-sans font-medium text-xs text-neutral-900 truncate">
                                      {slot.title}
                                    </h4>
                                    <p className="text-[11px] text-neutral-500 line-clamp-1 font-sans">
                                      {slot.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 rounded-xl bg-[#F8F9FA] text-center font-mono text-xs text-neutral-500">
                              No items synced for this store.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center space-y-3 bg-[#F8F9FA] rounded-3xl border border-neutral-200/80">
                  <ShieldAlert className="w-8 h-8 text-neutral-400 mx-auto" />
                  <h3 className="text-base font-semibold text-neutral-950">No Stores Found</h3>
                  <p className="text-xs text-neutral-500 font-mono">
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
            
            {settingsSaveSuccess && (
              <div className="p-4 rounded-2xl bg-neutral-900 text-white flex items-center justify-between text-xs font-mono shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Website Settings updated successfully!</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Column */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                
                <div className="border-b border-neutral-100 pb-4">
                  <h2 className="font-editorial text-2xl text-neutral-950 font-normal flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-neutral-600" />
                    <span>Global Website Settings</span>
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">
                    Edit dropshipping year, marketplace branding, and carousel slides.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  
                  {/* Dropshipping Year */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-neutral-200/60 space-y-2">
                    <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                      Dropshipping Cohort Year
                    </label>
                    <input
                      type="text"
                      value={siteSettings.dropshippingYear}
                      onChange={(e) => setSiteSettings({ ...siteSettings, dropshippingYear: e.target.value })}
                      required
                      placeholder="e.g. 2026"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 focus:border-black text-sm font-semibold text-neutral-900 focus:outline-none transition"
                    />
                  </div>

                  {/* Organization Title */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-neutral-200/60 space-y-2">
                    <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                      Marketplace Organization Title
                    </label>
                    <input
                      type="text"
                      value={siteSettings.siteTitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                      required
                      placeholder="e.g. MASTERS UNION"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-200 focus:border-black text-sm text-neutral-900 focus:outline-none transition"
                    />
                  </div>

                  {/* Hero Carousel Manager */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-neutral-200/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
                      <div>
                        <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                          Hero Carousel Slides ({siteSettings.carouselSlides?.length || 0})
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAddSlide("image_ad")}
                          className="pill-btn-secondary px-2.5 py-1 text-[10px] font-medium"
                        >
                          + Image Ad
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("video_ad")}
                          className="pill-btn-secondary px-2.5 py-1 text-[10px] font-medium"
                        >
                          + Video Ad
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSlide("image")}
                          className="pill-btn-secondary px-2.5 py-1 text-[10px] font-medium"
                        >
                          + Showcase
                        </button>
                      </div>
                    </div>

                    {/* Slides List */}
                    <div className="space-y-3 pt-1">
                      {(siteSettings.carouselSlides || []).map((slide, idx) => (
                        <div
                          key={slide.id}
                          className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono pb-2 border-b border-neutral-100">
                            <span className="font-semibold text-neutral-900">
                              Slide #{idx + 1} ({slide.type.toUpperCase()})
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveSlideUp(idx)}
                                disabled={idx === 0}
                                className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 flex items-center justify-center text-neutral-700"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveSlideDown(idx)}
                                disabled={idx === (siteSettings.carouselSlides || []).length - 1}
                                className="w-6 h-6 rounded bg-neutral-100 hover:bg-neutral-200 disabled:opacity-30 flex items-center justify-center text-neutral-700"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlide(slide.id)}
                                className="w-6 h-6 rounded bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">Badge</label>
                              <input
                                type="text"
                                value={slide.badge}
                                onChange={(e) => handleUpdateSlide(slide.id, { badge: e.target.value })}
                                className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs font-mono"
                              />
                            </div>

                            {slide.type !== "svg" && (
                              <div>
                                <label className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">Headline</label>
                                <input
                                  type="text"
                                  value={slide.title || ""}
                                  onChange={(e) => handleUpdateSlide(slide.id, { title: e.target.value })}
                                  placeholder="Headline"
                                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs"
                                />
                              </div>
                            )}

                            <div className="sm:col-span-2">
                              <label className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">Subtitle</label>
                              <input
                                type="text"
                                value={slide.subtitle || ""}
                                onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                                placeholder="Subtitle text..."
                                className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      type="submit"
                      className="pill-btn-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSettings}
                      className="pill-btn-secondary px-4 py-3 text-xs font-medium cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                  </div>

                </form>

              </div>

              {/* Security & Access Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                    <h3 className="font-editorial text-lg text-neutral-950 font-normal flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-neutral-600" />
                      <span>Admin Passcode Security</span>
                    </h3>
                  </div>

                  {adminKeySuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{adminKeySuccess}</span>
                    </div>
                  )}

                  {adminKeyError && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{adminKeyError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAdminKey} className="space-y-3">
                    <div>
                      <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        New Admin Passcode
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Min. 4 characters"
                        value={adminNewKey}
                        onChange={(e) => setAdminNewKey(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                        Confirm Passcode
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter passcode"
                        value={adminConfirmKey}
                        onChange={(e) => setAdminConfirmKey(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={handleResetAdminKey}
                        className="pill-btn-secondary px-3 py-2 text-[11px] font-medium"
                      >
                        Reset to .env
                      </button>

                      <button
                        type="submit"
                        disabled={!adminNewKey.trim()}
                        className="pill-btn-primary px-4 py-2 text-[11px] font-semibold uppercase tracking-wider disabled:opacity-40"
                      >
                        Save Key
                      </button>
                    </div>
                  </form>
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
