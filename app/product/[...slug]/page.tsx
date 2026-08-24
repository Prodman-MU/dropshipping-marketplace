/**
 * @file page.tsx (under app/product/[...slug]/)
 * @description Unified Catch-All Product Detail Page (PDP).
 * 
 * Supports:
 * - Canonical 2-segment URLs: /product/[store]/[handle] (e.g. /product/pause2play/minecraft-blocks-46-pcs)
 * - Legacy / direct 1-segment URLs: /product/[idOrHandle] (e.g. /product/slot-m-www-pause2play-in-2)
 * 
 * Features:
 * - Pure white gallery canvas with studio neutral image viewport
 * - High-contrast Playfair headline, variant pills, and dynamic discount % calculation
 * - Primary Shopify Store Checkout CTA & secondary WhatsApp B2B bulk inquiry
 * - Clickable merchant storefront link and "More Products from [Vendor]" showcase
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { SlotListing, MerchantVendor } from "@/data/mock-slots";
import { getInitialSlots, getInitialMerchants, saveSlots, saveMerchants } from "@/lib/store-manager";
import { formatCurrency, getStoreSlug, getProductHandle, isSameStoreDomain, getProductPageUrl } from "@/lib/utils";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";
import {
  ArrowLeft,
  ExternalLink,
  ShoppingBag,
  Store,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Package,
  Truck,
  HelpCircle,
} from "lucide-react";

export default function UnifiedProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // Extract route segments safely from catch-all [...slug]
  const rawSlug = params?.slug;
  const slugArray = Array.isArray(rawSlug) ? rawSlug : typeof rawSlug === "string" ? [rawSlug] : [];
  
  const storeParam = slugArray.length > 1 ? slugArray[0] : "";
  const handleParam = slugArray.length > 1 ? slugArray[1] : slugArray[0] || "";

  const [slots, setSlots] = useState<SlotListing[]>([]);
  const [merchants, setMerchants] = useState<MerchantVendor[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<"description" | "shipping" | "vendor" | null>("description");

  useEffect(() => {
    setSlots(getInitialSlots());
    setMerchants(getInitialMerchants());
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
        console.warn("Failed to load live database records in product page:", e);
      }
    };

    fetchLiveDbData();

    const handleStateChange = () => {
      setSlots(getInitialSlots());
      setMerchants(getInitialMerchants());
    };
    window.addEventListener("store-state-changed", handleStateChange);
    return () => window.removeEventListener("store-state-changed", handleStateChange);
  }, []);

  const slot = useMemo(() => {
    if (!handleParam) return null;
    const cleanHandle = handleParam.toLowerCase().trim();
    const cleanStore = storeParam.toLowerCase().trim();

    // 1. Primary match: 2-segment store slug + product handle
    if (cleanStore) {
      const exactMatch = slots.find((s) => {
        const sStore = getStoreSlug(s.merchant.myshopifyDomain || s.merchant.name || "");
        const sHandle = getProductHandle(s);
        const isStoreMatched = sStore === cleanStore || isSameStoreDomain(s.merchant.myshopifyDomain, cleanStore);
        const isHandleMatched = sHandle === cleanHandle || (s.handle && s.handle.toLowerCase() === cleanHandle);
        return isStoreMatched && isHandleMatched;
      });
      if (exactMatch) return exactMatch;
    }

    // 2. Direct ID or slotNumber match (supports legacy /product/slot-m-...)
    const idMatch = slots.find((s) => {
      return (
        s.id.toLowerCase() === cleanHandle ||
        s.slotNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === cleanHandle
      );
    });
    if (idMatch) return idMatch;

    // 3. Product handle match across all listings
    const handleOnlyMatch = slots.find((s) => {
      const sHandle = getProductHandle(s);
      return sHandle === cleanHandle || (s.handle && s.handle.toLowerCase() === cleanHandle);
    });
    if (handleOnlyMatch) return handleOnlyMatch;

    // 4. Fallback match on Shopify Product ID
    return slots.find((s) => s.shopifyProductId === handleParam) || null;
  }, [slots, storeParam, handleParam]);

  const vendorSlots = useMemo(() => {
    if (!slot) return [];
    return slots.filter(
      (s) =>
        s.id !== slot.id &&
        (s.merchant.id === slot.merchant.id ||
          s.merchant.myshopifyDomain === slot.merchant.myshopifyDomain)
    );
  }, [slots, slot]);

  const fallbackOtherSlots = useMemo(() => {
    if (!slot) return [];
    return slots.filter((s) => s.id !== slot.id).slice(0, 4);
  }, [slots, slot]);

  if (!slot) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Header activeVendorCount={merchants.filter((m) => m.status === "ACTIVE").length} totalSyncedProducts={slots.length} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#F8F9FA] rounded-3xl border border-neutral-200/80 p-10 max-w-md w-full text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto text-xl font-bold">
              🔍
            </div>
            <h2 className="font-editorial text-2xl text-neutral-950 font-normal">Product Not Found</h2>
            <p className="text-xs text-neutral-600">
              The requested product (<code className="font-mono text-neutral-900">{slugArray.join("/")}</code>) could not be located in our catalog.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="pill-btn-primary px-5 py-2.5 text-xs font-medium uppercase tracking-wider"
              >
                Back to Catalog
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const images = slot.images && slot.images.length > 0
    ? slot.images
    : ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"];

  const mainImage = images[selectedImageIndex] || images[0];
  const variants = slot.variants || [];
  const currentVariant = variants[selectedVariantIndex] || {
    id: "default",
    title: "Default Variant",
    price: slot.price,
    sku: slot.sku,
    inventoryQuantity: slot.inventoryQuantity,
    availableForSale: true,
  };

  const isOutOfStock = (!slot.isUnknownQuantity && slot.inventoryQuantity <= 0) || slot.status === "SOLD" || !currentVariant.availableForSale;

  const handleSelectVariant = (idx: number) => {
    setSelectedVariantIndex(idx);
    const variant = variants[idx];
    if (!variant) return;

    if (typeof variant.imageIndex === "number" && variant.imageIndex >= 0 && variant.imageIndex < images.length) {
      setSelectedImageIndex(variant.imageIndex);
    } else if (variant.imageUrl) {
      const match = images.findIndex((img) => img === variant.imageUrl || img.includes(variant.imageUrl!) || variant.imageUrl!.includes(img));
      if (match !== -1) {
        setSelectedImageIndex(match);
      }
    } else if (images.length > 1) {
      setSelectedImageIndex(idx % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header
        showBackButton
        activeVendorCount={merchants.filter((m) => m.status === "ACTIVE").length}
        totalSyncedProducts={slots.length}
      />

      {/* Main PDP Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
        {/* 2-Column Product Gallery & Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* COLUMN 1: Image Gallery (7 cols / ~58%) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary High-Resolution Studio Viewport */}
            <div className="relative w-full aspect-square sm:aspect-[4/3] bg-[#F5F5F7] rounded-2xl sm:rounded-3xl overflow-hidden group">
              <img
                src={mainImage}
                alt={slot.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
              />

              {/* Top Status Pill */}
              <div className="absolute top-4 left-4 z-10">
                {isOutOfStock ? (
                  <span className="status-pill bg-neutral-900 text-white border-neutral-900">
                    SOLD OUT
                  </span>
                ) : (
                  <span className="status-pill bg-white/95 backdrop-blur-xs text-neutral-900">
                    CURATED PIECE
                  </span>
                )}
              </div>

              {/* Navigation Arrows for Multi-image */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition cursor-pointer"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition cursor-pointer"
                    title="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-black scale-102 shadow-xs"
                        : "border-transparent opacity-60 hover:opacity-100 bg-[#F5F5F7]"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2: Sticky Purchase & Spec Details Column (5 cols / ~42%) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 self-start">
            
            {/* Brand, Category & Editorial Title */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                    {slot.merchant.name}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
                </div>

                <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                  {slot.category}
                </span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-4xl text-neutral-950 font-normal leading-[1.15] tracking-tight">
                {slot.title}
              </h1>

              {/* Clean Pricing Line with Discount % */}
              <div className="flex items-baseline gap-3 pt-2 flex-wrap">
                <span className="text-3xl font-semibold text-neutral-950">
                  {formatCurrency(currentVariant.price || slot.price, slot.currencyCode || "INR")}
                </span>

                {slot.compareAtPrice && slot.compareAtPrice > (currentVariant.price || slot.price) && (
                  <>
                    <span className="text-base text-neutral-400 line-through font-normal">
                      {formatCurrency(slot.compareAtPrice, slot.currencyCode || "INR")}
                    </span>
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {Math.round(((slot.compareAtPrice - (currentVariant.price || slot.price)) / slot.compareAtPrice) * 100)}% OFF
                    </span>
                  </>
                )}

                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest px-2 py-0.5 rounded-full bg-neutral-100">
                  WHOLESALE B2B
                </span>
              </div>
            </div>

            {/* Variant Selector Pills */}
            {variants.length > 1 && (
              <div className="space-y-2.5 pt-2">
                <label className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                  Select Variant ({variants.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, idx) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v.id || idx}
                        type="button"
                        onClick={() => handleSelectVariant(idx)}
                        className={`px-4 py-2.5 rounded-full text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? "bg-black text-white shadow-xs"
                            : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                        }`}
                      >
                        <span>{v.title}</span>
                        <span className={`ml-2 font-mono text-[10px] ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                          {formatCurrency(v.price, slot.currencyCode || "INR")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Direct Checkout on Shopify Store as Primary Action */}
              <a
                href={slot.productUrl || `https://${slot.merchant.myshopifyDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn-primary w-full py-4 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:bg-neutral-800 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Checkout on Shopify Store</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-300" />
              </a>

              {/* Secondary WhatsApp B2B Wholesale Inquiry */}
              <a
                href={`https://wa.me/${slot.merchant.whatsappNumber || "919876543210"}?text=${encodeURIComponent(
                  `Hi ${slot.merchant.name}! I want to source "${slot.title}" (Variant: ${currentVariant.title}, SKU: ${currentVariant.sku || slot.sku}). Price: ${formatCurrency(currentVariant.price || slot.price, slot.currencyCode || "INR")}. Please share wholesale dispatch details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn-secondary w-full py-3.5 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 text-neutral-800 hover:text-black cursor-pointer"
              >
                <span>Inquire & Source on WhatsApp</span>
              </a>
            </div>

            {/* Collapsible Accordion Sections */}
            <div className="divide-y divide-neutral-200/70 border-t border-b border-neutral-200/70 pt-2">
              
              {/* Accordion 1: Description & Specs */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "description" ? null : "description")}
                  className="w-full flex items-center justify-between text-left font-medium text-sm text-neutral-950 cursor-pointer"
                >
                  <span>Description & Specifications</span>
                  {openAccordion === "description" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>

                {openAccordion === "description" && (
                  <div className="pt-3 text-xs text-neutral-600 leading-relaxed space-y-3">
                    <p className="whitespace-pre-line font-normal">{slot.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-3 rounded-xl bg-[#F8F9FA] font-mono text-[11px]">
                        <span className="text-neutral-400 block mb-0.5">SKU ID:</span>
                        <span className="font-semibold text-neutral-900">{currentVariant.sku || slot.sku || "N/A"}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F9FA] font-mono text-[11px]">
                        <span className="text-neutral-400 block mb-0.5">INVENTORY:</span>
                        <span className="font-semibold text-neutral-900">{currentVariant.inventoryQuantity || slot.inventoryQuantity || "Live Sync"}</span>
                      </div>
                    </div>

                    {slot.tags && slot.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {slot.tags.map((t, idx) => (
                          <span key={idx} className="status-pill text-[10px] bg-neutral-50 text-neutral-600">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Merchant & Verification (Clickable Store Link) */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === "vendor" ? null : "vendor")}
                  className="w-full flex items-center justify-between text-left font-medium text-sm text-neutral-950 cursor-pointer"
                >
                  <span>Merchant Store Information</span>
                  {openAccordion === "vendor" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </button>

                {openAccordion === "vendor" && (
                  <div className="pt-3 space-y-3">
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F8F9FA] border border-neutral-200/60">
                      <a
                        href={`https://${slot.merchant.myshopifyDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 min-w-0 flex-1 group cursor-pointer"
                        title={`Visit ${slot.merchant.name} storefront`}
                      >
                        {slot.merchant.storeLogo ? (
                          <img
                            src={slot.merchant.storeLogo}
                            alt={slot.merchant.name}
                            className="w-10 h-10 rounded-full border border-neutral-200 object-cover bg-white shrink-0 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-semibold text-xs shrink-0 font-mono">
                            {slot.merchant.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-semibold text-neutral-950 truncate group-hover:underline">
                              {slot.merchant.name}
                            </h4>
                            <ShieldCheck className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                          </div>
                          <p className="font-mono text-[10px] text-neutral-500 hover:text-black truncate flex items-center gap-1">
                            <span>{slot.merchant.myshopifyDomain}</span>
                            <ExternalLink className="w-3 h-3 text-neutral-400 inline shrink-0" />
                          </p>
                        </div>
                      </a>

                      <a
                        href={`https://${slot.merchant.myshopifyDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-btn-secondary px-3.5 py-1.5 text-[11px] font-mono shrink-0 flex items-center gap-1 hover:bg-neutral-200 transition cursor-pointer"
                      >
                        <span>Visit Store</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* PRODUCTS BY THE SAME VENDOR */}
        {(vendorSlots.length > 0 || fallbackOtherSlots.length > 0) && (
          <div className="space-y-6 pt-10 border-t border-neutral-200/70">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest block">
                  {vendorSlots.length > 0 ? "MORE FROM THIS SELLER" : "MARKETPLACE SELECTIONS"}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-neutral-950 font-normal">
                  {vendorSlots.length > 0 ? `More Products from ${slot.merchant.name}` : "Curated Marketplace Selections"}
                </h3>
              </div>
              
              <a
                href={`https://${slot.merchant.myshopifyDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-neutral-600 hover:text-black flex items-center gap-1 font-mono cursor-pointer"
              >
                <span>Visit {slot.merchant.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
              {(vendorSlots.length > 0 ? vendorSlots : fallbackOtherSlots).map((displaySlot) => (
                <div key={displaySlot.id}>
                  <ListingCard
                    slot={displaySlot}
                    onSelect={() => router.push(getProductPageUrl(displaySlot))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Sticky Bottom Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-neutral-200/80 p-3 px-4 flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0">
          <span className="text-[10px] text-neutral-400 uppercase block font-mono">
            Wholesale Price
          </span>
          <span className="text-base font-semibold text-neutral-950">
            {formatCurrency(currentVariant.price || slot.price, slot.currencyCode || "INR")}
          </span>
        </div>

        <a
          href={slot.productUrl || `https://${slot.merchant.myshopifyDomain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pill-btn-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          Checkout
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200/70 bg-white mt-16 py-8 text-center font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
        © {siteSettings.dropshippingYear} {siteSettings.siteTitle} — ARCHIVAL DROPSHIPPING MARKETPLACE
      </footer>
    </div>
  );
}
