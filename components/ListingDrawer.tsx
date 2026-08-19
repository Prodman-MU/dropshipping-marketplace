"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Store,
  Layers,
  Package,
  Activity,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Tag,
  Cpu,
  ShoppingBag,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { SlotListing, VariantOption } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";
import { getInitialSlots } from "@/lib/store-manager";

interface ListingDrawerProps {
  slot: SlotListing | null;
  onClose: () => void;
  onSelectRelatedSlot?: (slot: SlotListing) => void;
}

export function ListingDrawer({ slot: initialSlot, onClose, onSelectRelatedSlot }: ListingDrawerProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "shopify" | "webhooks">("specs");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const [currentSlot, setCurrentSlot] = useState<SlotListing | null>(initialSlot);

  useEffect(() => {
    setCurrentSlot(initialSlot);
    setSelectedVariantIndex(0);
    setSelectedImageIndex(0);
    setCopied(false);
  }, [initialSlot]);

  if (!currentSlot) return null;

  const variants = currentSlot.variants && currentSlot.variants.length > 0 ? currentSlot.variants : [];
  const currentVariant = variants[selectedVariantIndex] || variants[0] || {
    id: currentSlot.shopifyVariantId,
    title: "Default Variant",
    price: currentSlot.price,
    sku: currentSlot.sku,
    inventoryQuantity: currentSlot.inventoryQuantity,
    availableForSale: currentSlot.inventoryQuantity > 0,
  };

  const isAvailable = currentSlot.status === "AVAILABLE";
  const isReserved = currentSlot.status === "RESERVED";
  const isSold = currentSlot.status === "SOLD";

  const images = currentSlot.images && currentSlot.images.length > 0 ? currentSlot.images : ["/placeholder.jpg"];
  const mainImage = images[selectedImageIndex] || images[0];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCopySpecs = () => {
    const specsText = `Product: ${currentSlot.title}\nSKU: ${currentVariant.sku || currentSlot.sku}\nVariant: ${currentVariant.title}\nPrice: ₹${currentVariant.price || currentSlot.price}\nCategory: ${currentSlot.category}\nStore: ${currentSlot.merchant.name} (${currentSlot.merchant.myshopifyDomain})\nDetails: ${currentSlot.description}`;
    navigator.clipboard.writeText(specsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 240 }}
          className="relative z-10 w-full max-w-6xl bg-[#F4F4F0] border-4 border-[#111111] shadow-[10px_10px_0px_#111111] overflow-hidden flex flex-col max-h-[92vh]"
        >
          
          {/* Header Bar */}
          <div className="px-4 py-3 bg-white border-b-4 border-[#111111] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-[#D62828] border-2 border-[#111111] flex items-center justify-center font-display font-black text-xs text-white shadow-[2px_2px_0px_#111111] shrink-0">
                MU
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono font-black text-[#005F73] uppercase tracking-wider block">
                  PRODUCT SPECIFICATION & STOREFRONT SHEET
                </span>
                <h2 className="text-sm sm:text-base font-black text-[#111111] font-display uppercase tracking-tight truncate">
                  {currentSlot.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 font-mono">
              {isAvailable && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-black bg-emerald-300 text-[#111111] border border-[#111111]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                  AVAILABLE
                </span>
              )}
              {isReserved && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-black bg-[#FFB703] text-[#111111] border border-[#111111]">
                  RESERVED
                </span>
              )}
              {isSold && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-black bg-[#E5E5E0] text-[#111111] border border-[#111111]">
                  SOLD OUT
                </span>
              )}

              <Link
                href={`/product/${currentSlot.id}`}
                target="_blank"
                className="p-1.5 bg-[#F4F4F0] hover:bg-[#111111] hover:text-white border-2 border-[#111111] transition-colors flex items-center gap-1 text-[11px] font-black uppercase"
                title="Open dedicated product page"
              >
                <span className="hidden md:inline">Full Page</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>

              <button
                onClick={onClose}
                className="p-1.5 bg-[#FFB703] border-2 border-[#111111] hover:bg-[#D62828] hover:text-white transition-colors"
                title="Close Window"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Modal Main Body: 3-Column Split */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-white">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
              
              {/* COLUMN 1: Image Gallery (5 cols / ~42%) */}
              <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                {/* Main Image Frame */}
                <div className="relative w-full aspect-square sm:aspect-4/3 bg-[#F4F4F0] border-4 border-[#111111] shadow-[6px_6px_0px_#111111] overflow-hidden group">
                  <img
                    src={mainImage}
                    alt={currentSlot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Carousel Prev/Next Buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/95 hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-all"
                        title="Previous Image"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/95 hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-all"
                        title="Next Image"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-mono font-black border border-white">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile View (< sm): Pagination Dots Indicator */}
                {images.length > 1 && (
                  <div className="flex sm:hidden items-center justify-center gap-2 py-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`transition-all ${
                          selectedImageIndex === idx
                            ? "w-6 h-2.5 bg-[#111111] border border-[#111111] rounded-full shadow-[1px_1px_0px_#FFB703]"
                            : "w-2.5 h-2.5 bg-[#D5D5D0] hover:bg-[#111111] border border-[#111111] rounded-full"
                        }`}
                        title={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Tablet & Desktop View (sm+): Thumbnails Row */}
                {images.length > 1 && (
                  <div className="hidden sm:flex items-center gap-2.5 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-14 h-14 border-2 border-[#111111] shrink-0 transition-all ${
                          selectedImageIndex === idx
                            ? "bg-[#FFB703] shadow-[3px_3px_0px_#111111] scale-105"
                            : "opacity-70 hover:opacity-100 bg-white"
                        }`}
                      >
                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 2: Title, Tabs, Variant Selector, Description & Specs (4 cols / ~33%) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* 1. Category Tag & Full Product Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 text-[11px] font-mono font-black uppercase bg-[#005F73] text-white border border-[#111111]">
                      {currentSlot.category}
                    </span>

                    {/* Tab Navigation Controls */}
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <button
                        onClick={() => setActiveTab("specs")}
                        className={`px-2 py-0.5 font-black uppercase border border-[#111111] text-[10px] transition-all ${
                          activeTab === "specs"
                            ? "bg-[#111111] text-[#FFB703] shadow-[1px_1px_0px_#111111]"
                            : "bg-[#F4F4F0] text-[#111111] hover:bg-white"
                        }`}
                      >
                        Specs
                      </button>
                      <button
                        onClick={() => setActiveTab("shopify")}
                        className={`px-2 py-0.5 font-black uppercase border border-[#111111] text-[10px] transition-all ${
                          activeTab === "shopify"
                            ? "bg-[#111111] text-[#FFB703] shadow-[1px_1px_0px_#111111]"
                            : "bg-[#F4F4F0] text-[#111111] hover:bg-white"
                        }`}
                      >
                        Data
                      </button>
                      <button
                        onClick={() => setActiveTab("webhooks")}
                        className={`px-2 py-0.5 font-black uppercase border border-[#111111] text-[10px] flex items-center gap-1 transition-all ${
                          activeTab === "webhooks"
                            ? "bg-[#111111] text-[#FFB703] shadow-[1px_1px_0px_#111111]"
                            : "bg-[#F4F4F0] text-[#111111] hover:bg-white"
                        }`}
                      >
                        <Activity className="w-3 h-3" />
                        <span>Logs ({currentSlot.syncLogs.length})</span>
                      </button>
                    </div>
                  </div>

                  <h1 className="text-lg sm:text-xl font-black text-[#111111] font-display uppercase tracking-tight leading-tight">
                    {currentSlot.title}
                  </h1>
                </div>

                {/* TAB 1: PRODUCT SPECS */}
                {activeTab === "specs" && (
                  <div className="space-y-3.5">
                    
                    {/* 2. Variant Selector */}
                    {variants.length > 1 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider block">
                          Select Variant ({variants.length} Available):
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {variants.map((v, idx) => (
                            <button
                              key={v.id || idx}
                              onClick={() => handleSelectVariant(idx)}
                              className={`p-2 border-2 border-[#111111] text-left font-mono text-xs transition-all ${
                                selectedVariantIndex === idx
                                  ? "bg-[#111111] text-white shadow-[2px_2px_0px_#FFB703]"
                                  : "bg-white text-[#111111] hover:bg-[#F4F4F0]"
                              }`}
                            >
                              <span className="font-black block line-clamp-1 text-[11px]">{v.title}</span>
                              <span className="text-[10px] opacity-80 block">{formatCurrency(v.price, v.currencyCode || currentSlot.currencyCode || "INR")}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Product Description */}
                    <div className="space-y-1 font-mono text-xs">
                      <span className="text-[10px] font-bold text-[#2B2D42] uppercase block">
                        Product Description & Specification:
                      </span>
                      <div className="text-zinc-800 leading-relaxed font-sans text-xs sm:text-sm font-semibold bg-[#F4F4F0] p-3.5 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] min-h-[90px] max-h-52 overflow-y-auto pr-2">
                        <p className="whitespace-pre-line">{currentSlot.description}</p>
                      </div>
                    </div>

                    {/* 4. Product Discovery Tags */}
                    {currentSlot.tags && currentSlot.tags.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {currentSlot.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[#F4F4F0] border border-[#111111] text-[10px] font-mono font-bold text-[#111111]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 2: SHOPIFY INVENTORY & DATA */}
                {activeTab === "shopify" && (
                  <div className="space-y-3 font-mono">
                    <div className="bg-white p-3.5 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                      <div className="text-xs font-black text-[#111111] uppercase border-b border-[#111111] pb-1 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-[#005F73]" />
                        <span>Storefront GraphQL Identifiers</span>
                      </div>
                      <div className="text-[11px] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Shopify Product ID:</span>
                          <span className="font-bold truncate max-w-[170px]">{currentSlot.shopifyProductId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Primary Variant ID:</span>
                          <span className="font-bold truncate max-w-[170px]">{currentVariant.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Handle / Slug:</span>
                          <span className="font-bold">{currentSlot.handle || "default-slug"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">SKU Code:</span>
                          <span className="font-black text-[#D62828]">{currentVariant.sku || currentSlot.sku}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                      <div className="text-xs font-black text-[#111111] uppercase border-b border-[#111111] pb-1 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#D62828]" />
                        <span>Inventory Warehouse Health</span>
                      </div>
                      <div className="text-[11px] space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Status Tag:</span>
                          <span className={`font-black ${isAvailable ? "text-emerald-600" : isReserved ? "text-amber-600" : "text-rose-600"}`}>
                            {currentSlot.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Stock Availability:</span>
                          <span className={`font-black ${isAvailable ? "text-emerald-700" : "text-rose-600"}`}>
                            {isAvailable ? "IN STOCK (ACTIVE)" : "OUT OF STOCK"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Store Domain:</span>
                          <span className="font-bold">{currentSlot.merchant.myshopifyDomain}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: REAL-TIME AUDIT WEBHOOK LOGS */}
                {activeTab === "webhooks" && (
                  <div className="space-y-2 font-mono">
                    {currentSlot.syncLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-black">
                          <span className="px-2 py-0.5 bg-[#FFB703] border border-[#111111] text-[10px]">
                            {log.eventType}
                          </span>
                          <span className="text-[#2B2D42] text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {log.timestamp}
                          </span>
                        </div>
                        <p className="text-[#111111] text-[11px] font-semibold">{log.details}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* COLUMN 3: Sticky Buy Box & Vendor Card (3 cols / ~25%) */}
              <div className="lg:col-span-3 space-y-3.5">
                
                {/* Price & Stock Status Box (Clean Informational Display) */}
                <div className="bg-transparent border-b-2 border-[#111111] pb-2.5 space-y-1">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-[#111111]">
                        {formatCurrency(currentVariant.price || currentSlot.price, currentVariant.currencyCode || currentSlot.currencyCode || "INR")}
                      </span>
                      {currentSlot.compareAtPrice && currentSlot.compareAtPrice > currentSlot.price && (
                        <span className="text-xs font-mono text-zinc-500 line-through font-bold">
                          {formatCurrency(currentSlot.compareAtPrice, currentSlot.currencyCode || "INR")}
                        </span>
                      )}
                    </div>

                    {((!currentSlot.isUnknownQuantity && currentSlot.inventoryQuantity <= 0) || currentSlot.status === "SOLD" || !currentVariant.availableForSale) && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-[#D62828] text-white border border-[#111111] uppercase">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-wider block">
                    Retail Price (Taxes Included)
                  </span>
                </div>

                {/* Action CTAs for Buying & Inquiries */}
                <div className="space-y-2.5">
                  {/* WhatsApp Vendor Inquiry */}
                  <a
                    href={`https://wa.me/${currentSlot.merchant.whatsappNumber || "919876543210"}?text=${encodeURIComponent(
                      `Hi ${currentSlot.merchant.name}! I want to purchase "${currentSlot.title}" (Variant: ${currentVariant.title}, SKU: ${currentVariant.sku || currentSlot.sku}). Price: ${formatCurrency(currentVariant.price || currentSlot.price, currentSlot.currencyCode || "INR")}. Please share purchase & delivery details.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#128C7E] text-white border-3 border-[#111111] text-xs font-mono font-black flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#111111] hover:shadow-[1px_1px_0px_#111111] transition-all uppercase tracking-wider text-center"
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                    <span>CONTACT / BUY ON WHATSAPP</span>
                  </a>

                  {/* Direct Checkout on Shopify */}
                  <a
                    href={currentSlot.productUrl || `https://${currentSlot.merchant.myshopifyDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-[#111111] hover:bg-[#D62828] text-white border-3 border-[#111111] text-xs font-mono font-black flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#FFB703] hover:shadow-[1px_1px_0px_#FFB703] transition-all uppercase tracking-wider text-center"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#FFB703] shrink-0" />
                    <span>CHECKOUT ON SHOPIFY</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>

                {/* Vendor Information Box (Clean Profile Card) */}
                <div className="bg-[#F4F4F0] border-2 border-[#111111] p-3 space-y-2 font-mono">
                  <div className="flex items-center justify-between border-b border-[#111111]/30 pb-1">
                    <span className="text-[10px] font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#005F73]" />
                      <span>Merchant Vendor</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 border border-emerald-500 px-1.5 py-0.5 text-[9px]">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {currentSlot.merchant.storeLogo ? (
                      <img
                        src={currentSlot.merchant.storeLogo}
                        alt={currentSlot.merchant.name}
                        className="w-9 h-9 border border-[#111111] object-cover bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-[#FFB703] border border-[#111111] flex items-center justify-center font-black text-xs shrink-0">
                        {currentSlot.merchant.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-[#111111] font-display uppercase truncate">
                        {currentSlot.merchant.name}
                      </h4>
                      <a
                        href={`https://${currentSlot.merchant.myshopifyDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#005F73] font-bold hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{currentSlot.merchant.myshopifyDomain}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}



