"use client";

import React, { useState } from "react";
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
  ShoppingCart,
  Zap,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SlotListing, VariantOption } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";

interface ListingDrawerProps {
  slot: SlotListing | null;
  onClose: () => void;
}

export function ListingDrawer({ slot, onClose }: ListingDrawerProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "shopify" | "webhooks">("specs");
  const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!slot) return null;

  const currentVariant = selectedVariant || slot.variants[0] || {
    id: slot.shopifyVariantId,
    title: "Default Variant",
    price: slot.price,
    sku: slot.sku,
    inventoryQuantity: slot.inventoryQuantity,
    availableForSale: slot.inventoryQuantity > 0,
  };

  const isAvailable = slot.status === "AVAILABLE";
  const isReserved = slot.status === "RESERVED";
  const isSold = slot.status === "SOLD";

  const images = slot.images && slot.images.length > 0 ? slot.images : ["/placeholder.jpg"];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
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
          className="relative z-10 w-full max-w-5xl bg-[#F4F4F0] border-4 border-[#111111] shadow-[10px_10px_0px_#111111] overflow-hidden flex flex-col max-h-[94vh]"
        >
          
          {/* Header Bar */}
          <div className="px-4 py-3 bg-white border-b-4 border-[#111111] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#D62828] border-2 border-[#111111] flex items-center justify-center font-display font-black text-xs text-white shadow-[2px_2px_0px_#111111]">
                MU
              </div>
              <div>
                <span className="text-[9px] font-mono font-black text-[#005F73] uppercase tracking-wider block">
                  PRODUCT SPECIFICATION SHEET
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#111111] font-display uppercase tracking-tight line-clamp-1">
                  {slot.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isAvailable && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-black bg-emerald-300 text-[#111111] border border-[#111111]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                  AVAILABLE
                </span>
              )}
              {isReserved && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-black bg-[#FFB703] text-[#111111] border border-[#111111]">
                  RESERVED
                </span>
              )}
              {isSold && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-black bg-[#E5E5E0] text-[#111111] border border-[#111111]">
                  SOLD OUT
                </span>
              )}

              <button
                onClick={onClose}
                className="p-1.5 bg-[#FFB703] border-2 border-[#111111] hover:bg-[#D62828] hover:text-white transition-colors"
                title="Close Window"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Modal Main Body: Split Grid (Left Carousel | Right Content) */}
          <div className="flex-1 overflow-y-auto lg:overflow-visible p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LEFT COLUMN: IMAGE CAROUSEL (col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
              
              <div className="space-y-3">
                {/* Main Display Image Frame with Controls */}
                <div className="relative w-full h-56 sm:h-64 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] overflow-hidden group">
                  <img
                    src={images[selectedImageIndex]}
                    alt={slot.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Carousel Prev/Next Overlay Buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/95 hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-all"
                        title="Previous Image"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/95 hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-all"
                        title="Next Image"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Image Counter Badge */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#111111] text-white text-[10px] font-mono font-black border border-white">
                        {selectedImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-12 h-12 border-2 border-[#111111] shrink-0 transition-all ${
                          selectedImageIndex === idx
                            ? "bg-[#FFB703] shadow-[2px_2px_0px_#111111] scale-105"
                            : "opacity-70 hover:opacity-100 bg-white"
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Vendor Store Profile Badge */}
              <div className="bg-white border-2 border-[#111111] p-3 shadow-[3px_3px_0px_#111111] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {slot.merchant.storeLogo && (
                    <img
                      src={slot.merchant.storeLogo}
                      alt={slot.merchant.name}
                      className="w-8 h-8 object-cover border border-[#111111]"
                    />
                  )}
                  <div>
                    <span className="text-[9px] font-mono font-black text-[#005F73] uppercase">APPROVED VENDOR STORE</span>
                    <h4 className="text-xs font-black text-[#111111] font-display uppercase">{slot.merchant.name}</h4>
                    <p className="text-[10px] font-mono text-[#2B2D42] font-bold">{slot.merchant.myshopifyDomain}</p>
                  </div>
                </div>

                <a
                  href={`https://${slot.merchant.myshopifyDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-[#FFB703] border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                  title="Visit Shopify Storefront"
                >
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>

            </div>

            {/* RIGHT COLUMN: EVERYTHING ELSE (col-span-7) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              
              <div className="space-y-3.5">
                
                {/* Price Display */}
                <div className="flex items-center justify-between bg-white p-3 border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
                  <div>
                    <span className="text-[9px] font-mono text-[#2B2D42] uppercase block font-bold">Selected Variant Price</span>
                    <span className="text-2xl font-black text-[#111111] font-mono">
                      {formatCurrency(currentVariant.price, currentVariant.currencyCode || slot.currencyCode || "INR")}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 bg-[#FFB703] text-[#111111] border border-[#111111] font-mono text-xs font-black uppercase">
                    {slot.category}
                  </span>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-1.5 font-mono text-xs border-b-2 border-[#111111] pb-2">
                  <button
                    onClick={() => setActiveTab("specs")}
                    className={`px-3 py-1.5 font-black uppercase border-2 border-[#111111] text-[11px] transition-all ${
                      activeTab === "specs"
                        ? "bg-[#111111] text-white shadow-[2px_2px_0px_#FFB703]"
                        : "bg-white text-[#111111] hover:bg-[#FFB703]"
                    }`}
                  >
                    Product Specs
                  </button>
                  <button
                    onClick={() => setActiveTab("shopify")}
                    className={`px-3 py-1.5 font-black uppercase border-2 border-[#111111] text-[11px] transition-all ${
                      activeTab === "shopify"
                        ? "bg-[#111111] text-white shadow-[2px_2px_0px_#FFB703]"
                        : "bg-white text-[#111111] hover:bg-[#FFB703]"
                    }`}
                  >
                    Inventory Specs
                  </button>
                  <button
                    onClick={() => setActiveTab("webhooks")}
                    className={`px-3 py-1.5 font-black uppercase border-2 border-[#111111] text-[11px] flex items-center gap-1 transition-all ${
                      activeTab === "webhooks"
                        ? "bg-[#111111] text-white shadow-[2px_2px_0px_#FFB703]"
                        : "bg-white text-[#111111] hover:bg-[#FFB703]"
                    }`}
                  >
                    <Activity className="w-3 h-3" />
                    <span>Sync Logs ({slot.syncLogs.length})</span>
                  </button>
                </div>

                {/* TAB 1: PRODUCT SPECS */}
                {activeTab === "specs" && (
                  <div className="space-y-3">
                    {/* Description */}
                    <div>
                      <h4 className="text-[11px] font-mono font-bold text-[#111111] uppercase tracking-wider mb-1">
                        Product Description & Overview
                      </h4>
                      <p className="text-xs font-semibold text-[#111111] leading-relaxed bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] line-clamp-3">
                        {slot.description}
                      </p>
                    </div>

                    {/* Variant Selection */}
                    {slot.variants && slot.variants.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-mono font-bold text-[#111111] uppercase tracking-wider mb-1">
                          Available Variants ({slot.variants.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {slot.variants.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariant(v)}
                              className={`p-2 border-2 border-[#111111] text-left font-mono transition-all ${
                                currentVariant.id === v.id
                                  ? "bg-[#FFB703] text-[#111111] shadow-[2px_2px_0px_#111111]"
                                  : "bg-white text-[#111111] hover:bg-[#E5E5E0]"
                              }`}
                            >
                              <div className="text-[11px] font-black uppercase truncate">{v.title}</div>
                              <div className="flex items-center justify-between mt-0.5 text-[10px] font-bold">
                                <span>SKU: {v.sku}</span>
                                <span className="text-[#D62828] font-black">
                                  {formatCurrency(v.price, v.currencyCode || slot.currencyCode || "INR")}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category & Tags */}
                    <div>
                      <h4 className="text-[11px] font-mono font-bold text-[#111111] uppercase tracking-wider mb-1">
                        Tags & Attributes
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {slot.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-white text-[#111111] border border-[#111111] text-[10px] font-mono font-bold">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SHOPIFY INVENTORY */}
                {activeTab === "shopify" && (
                  <div className="space-y-3">
                    <div className="bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[#2B2D42] block text-[9px] uppercase font-bold">Stock SKU</span>
                          <span className="text-[#005F73] font-black">{currentVariant.sku}</span>
                        </div>
                        <div>
                          <span className="text-[#2B2D42] block text-[9px] uppercase font-bold">Available Inventory</span>
                          <span className="text-[#111111] font-black">{currentVariant.inventoryQuantity} Units</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#2B2D42] block text-[9px] uppercase font-bold">Shopify Product GID</span>
                        <span className="text-[#111111] bg-[#F4F4F0] px-2.5 py-1 border border-[#111111] block mt-0.5 break-all text-[11px] font-bold">
                          {slot.shopifyProductId}
                        </span>
                      </div>
                    </div>

                    {/* Variants Table */}
                    <div className="overflow-x-auto border-2 border-[#111111] bg-white">
                      <table className="w-full text-left font-mono text-[11px]">
                        <thead className="bg-[#111111] text-white uppercase border-b-2 border-[#111111]">
                          <tr>
                            <th className="p-2">Variant Title</th>
                            <th className="p-2">SKU</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#111111]">
                          {slot.variants.map((v) => (
                            <tr key={v.id} className="hover:bg-[#F4F4F0] transition-colors">
                              <td className="p-2 font-black text-[#111111]">{v.title}</td>
                              <td className="p-2 text-[#2B2D42]">{v.sku}</td>
                              <td className="p-2 text-[#D62828] font-black">
                                {formatCurrency(v.price, v.currencyCode || slot.currencyCode || "INR")}
                              </td>
                              <td className="p-2 text-[#111111] font-bold">{v.inventoryQuantity} Units</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: WEBHOOK LOGS */}
                {activeTab === "webhooks" && (
                  <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto pr-1">
                    {slot.syncLogs.map((log) => (
                      <div key={log.id} className="p-2.5 bg-white border-2 border-[#111111] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-[#111111] text-white font-black text-[9px]">
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

              {/* Bottom Sticky CTA Action Buttons */}
              <div className="pt-3 border-t-2 border-[#111111] flex flex-wrap items-center gap-2.5">
                {slot.merchant.whatsappNumber && (
                  <a
                    href={`https://wa.me/${slot.merchant.whatsappNumber}?text=${encodeURIComponent(
                      `Hi! I found "${slot.title}" (Variant: ${currentVariant.title}, SKU: ${
                        currentVariant.sku || slot.sku
                      }, Price: ${formatCurrency(currentVariant.price, currentVariant.currencyCode || slot.currencyCode || "INR")}) on Masters' Union Marketplace. I would like to inquire about purchasing this item: ${
                        slot.productUrl || `https://${slot.merchant.myshopifyDomain}`
                      }`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-400 text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-mono font-black uppercase flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4 text-[#111111]" />
                    <span>WhatsApp Vendor</span>
                  </a>
                )}

                <a
                  href={slot.productUrl || `https://${slot.merchant.myshopifyDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-[#D62828] text-white border-2 border-[#111111] bauhaus-btn text-xs font-mono font-black uppercase flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-[#FFB703]" />
                  <span>Buy on Shopify</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}


