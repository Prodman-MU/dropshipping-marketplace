/**
 * @file ListingDrawer.tsx
 * @description Apple Store x MR PORTER Gallery-Grade Quick View Modal.
 * 
 * Features:
 * - Frosted backdrop with smooth spring scale animation
 * - Neutral studio photography carousel with thumbnail selectors
 * - Grailed micro-data specs & Playfair editorial title
 * - Margin calculation callouts & variant selection pills
 * - Matte black pill CTAs for store syncing and copying specifications
 */

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
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { SlotListing, VariantOption } from "@/data/mock-slots";
import { formatCurrency, getProductPageUrl } from "@/lib/utils";

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
  const isOutOfStock = (!currentSlot.isUnknownQuantity && currentSlot.inventoryQuantity <= 0) || currentSlot.status === "SOLD";

  const images = currentSlot.images && currentSlot.images.length > 0 ? currentSlot.images : ["/placeholder.jpg"];
  const mainImage = images[selectedImageIndex] || images[0];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCopySpecs = () => {
    const specsText = `Product: ${currentSlot.title}\nSKU: ${currentVariant.sku || currentSlot.sku}\nVariant: ${currentVariant.title}\nWholesale Price: ₹${currentVariant.price || currentSlot.price}\nCategory: ${currentSlot.category}\nStore: ${currentSlot.merchant.name} (${currentSlot.merchant.myshopifyDomain})\nDetails: ${currentSlot.description}`;
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-hidden">
        {/* Frosted Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Sheet Container */}
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative z-10 w-full max-w-5xl bg-white rounded-3xl border border-neutral-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest truncate">
                {currentSlot.merchant.name} // {currentSlot.category}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {isOutOfStock ? (
                <span className="status-pill bg-neutral-900 text-white border-neutral-900">
                  SOLD OUT
                </span>
              ) : (
                <span className="status-pill bg-neutral-100 text-neutral-800 border-neutral-200">
                  AVAILABLE
                </span>
              )}

              <Link
                href={getProductPageUrl(currentSlot)}
                target="_blank"
                className="pill-btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1"
                title="Open dedicated product page"
              >
                <span>Full Page</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Content Split */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Gallery Viewport (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative w-full aspect-square bg-[#F5F5F7] rounded-2xl overflow-hidden group">
                  <img
                    src={mainImage}
                    alt={currentSlot.title}
                    className="w-full h-full object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition"
                        title="Previous Image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md flex items-center justify-center transition"
                        title="Next Image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                          selectedImageIndex === idx
                            ? "border-black scale-102"
                            : "border-transparent opacity-60 hover:opacity-100 bg-[#F5F5F7]"
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Spec & Purchase Column (6 cols) */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Brand & Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                      {currentSlot.merchant.name}
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
                  </div>

                  <h1 className="font-editorial text-2xl sm:text-3xl text-neutral-950 font-normal leading-tight">
                    {currentSlot.title}
                  </h1>

                  {/* Clean Price Line */}
                  <div className="flex items-baseline gap-3 pt-1 flex-wrap">
                    <span className="font-semibold text-2xl text-neutral-950">
                      {formatCurrency(currentVariant.price || currentSlot.price, currentVariant.currencyCode || currentSlot.currencyCode || "INR")}
                    </span>

                    {currentSlot.compareAtPrice && currentSlot.compareAtPrice > (currentVariant.price || currentSlot.price) && (
                      <>
                        <span className="text-sm text-neutral-400 line-through">
                          {formatCurrency(currentSlot.compareAtPrice, currentSlot.currencyCode || "INR")}
                        </span>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {Math.round(((currentSlot.compareAtPrice - (currentVariant.price || currentSlot.price)) / currentSlot.compareAtPrice) * 100)}% OFF
                        </span>
                      </>
                    )}

                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                      WHOLESALE RATE
                    </span>
                  </div>
                </div>

                {/* Variant Selection Pills */}
                {variants.length > 1 && (
                  <div className="space-y-2.5">
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
                            className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                              isSelected
                                ? "bg-black text-white shadow-xs"
                                : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                            }`}
                          >
                            <span>{v.title}</span>
                            <span className={`ml-2 font-mono text-[10px] ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                              {formatCurrency(v.price, v.currencyCode || currentSlot.currencyCode || "INR")}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tabs for Specification vs Data */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("specs")}
                      className={`pb-1 text-xs font-medium transition relative ${
                        activeTab === "specs"
                          ? "text-black font-semibold"
                          : "text-neutral-400 hover:text-neutral-700"
                      }`}
                    >
                      Specifications
                      {activeTab === "specs" && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-black" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("shopify")}
                      className={`pb-1 text-xs font-medium transition relative ${
                        activeTab === "shopify"
                          ? "text-black font-semibold"
                          : "text-neutral-400 hover:text-neutral-700"
                      }`}
                    >
                      Shopify Metadata
                      {activeTab === "shopify" && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-black" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("webhooks")}
                      className={`pb-1 text-xs font-medium transition relative ${
                        activeTab === "webhooks"
                          ? "text-black font-semibold"
                          : "text-neutral-400 hover:text-neutral-700"
                      }`}
                    >
                      Sync Logs ({currentSlot.syncLogs.length})
                      {activeTab === "webhooks" && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-black" />
                      )}
                    </button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "specs" && (
                    <div className="space-y-3 text-xs text-neutral-600 leading-relaxed max-h-44 overflow-y-auto pr-1">
                      <p className="whitespace-pre-line font-normal">{currentSlot.description}</p>
                    </div>
                  )}

                  {activeTab === "shopify" && (
                    <div className="space-y-2 text-xs font-mono max-h-44 overflow-y-auto">
                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 space-y-1">
                        <div><span className="text-neutral-400">PRODUCT ID:</span> {currentSlot.shopifyProductId}</div>
                        <div><span className="text-neutral-400">STORE DOMAIN:</span> {currentSlot.merchant.myshopifyDomain}</div>
                        <div><span className="text-neutral-400">SLOT ID:</span> {currentSlot.slotNumber}</div>
                      </div>
                    </div>
                  )}

                  {activeTab === "webhooks" && (
                    <div className="space-y-2 text-xs font-mono max-h-44 overflow-y-auto">
                      {currentSlot.syncLogs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 flex items-center justify-between">
                          <span className="font-medium text-neutral-800">{log.eventType}</span>
                          <span className="text-[10px] text-neutral-400">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="space-y-2.5 pt-4 border-t border-neutral-100">
                  <a
                    href={`https://${currentSlot.merchant.myshopifyDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill-btn-primary w-full py-3.5 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <span>View on Merchant Store</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySpecs}
                      className="pill-btn-secondary flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Specs Copied to Clipboard" : "Copy Product Specs"}</span>
                    </button>
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
