"use client";

import React, { useState, useEffect } from "react";
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
  Lightbulb,
  TrendingUp,
  Sparkles,
  Check,
  DollarSign,
  PackageCheck,
  Award,
  Flame,
  ArrowRight,
} from "lucide-react";
import { SlotListing, VariantOption } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";
import {
  getInitialSlots,
  updateSlotPrice,
  restockSlotInventory,
  updateSlotTags,
} from "@/lib/store-manager";

interface ListingDrawerProps {
  slot: SlotListing | null;
  onClose: () => void;
  onSelectRelatedSlot?: (slot: SlotListing) => void;
}

export function ListingDrawer({ slot: initialSlot, onClose, onSelectRelatedSlot }: ListingDrawerProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "shopify" | "webhooks" | "recommendations">("specs");
  const [selectedVariant, setSelectedVariant] = useState<VariantOption | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Local state for live reactivity after recommendation actions
  const [currentSlot, setCurrentSlot] = useState<SlotListing | null>(initialSlot);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [allSlots, setAllSlots] = useState<SlotListing[]>([]);

  useEffect(() => {
    setCurrentSlot(initialSlot);
    setSelectedVariant(null);
    setSelectedImageIndex(0);
    setActionNotice(null);
    setAllSlots(getInitialSlots());
  }, [initialSlot]);

  if (!currentSlot) return null;

  const currentVariant = selectedVariant || currentSlot.variants[0] || {
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

  // Related Cross-Sell Items
  const relatedListings = allSlots
    .filter((s) => s.id !== currentSlot.id && (s.category === currentSlot.category || s.merchant.id === currentSlot.merchant.id))
    .slice(0, 2);

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Recommendation Actions
  const handleApplyPriceOptimization = () => {
    const recommendedPrice = Math.round(currentSlot.price * 1.08); // +8% benchmark margin
    const updatedList = updateSlotPrice(currentSlot.id, recommendedPrice, getInitialSlots());
    const updatedItem = updatedList.find((s) => s.id === currentSlot.id);
    if (updatedItem) {
      setCurrentSlot(updatedItem);
      setActionNotice(`✅ Price optimized to ${formatCurrency(recommendedPrice, currentSlot.currencyCode || "INR")}`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleSimulateRestock = () => {
    const updatedList = restockSlotInventory(currentSlot.id, 25, getInitialSlots());
    const updatedItem = updatedList.find((s) => s.id === currentSlot.id);
    if (updatedItem) {
      setCurrentSlot(updatedItem);
      setActionNotice(`✅ Restocked +25 Units! New total stock: ${updatedItem.inventoryQuantity} units.`);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleAutoOptimizeTags = () => {
    const newTags = ["bestseller", "trending2026", "verified-stock"];
    const updatedList = updateSlotTags(currentSlot.id, newTags, getInitialSlots());
    const updatedItem = updatedList.find((s) => s.id === currentSlot.id);
    if (updatedItem) {
      setCurrentSlot(updatedItem);
      setActionNotice(`✅ AI Tags added: ${newTags.join(", ")}`);
      setTimeout(() => setActionNotice(null), 4000);
    }
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
          
          {/* Action Notice Alert */}
          {actionNotice && (
            <div className="bg-[#FFB703] text-[#111111] px-4 py-2 font-mono text-xs font-black border-b-2 border-[#111111] flex items-center justify-between animate-fadeIn">
              <span>{actionNotice}</span>
              <button onClick={() => setActionNotice(null)} className="p-0.5 hover:bg-[#111111] hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="px-4 py-3 bg-white border-b-4 border-[#111111] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#D62828] border-2 border-[#111111] flex items-center justify-center font-display font-black text-xs text-white shadow-[2px_2px_0px_#111111]">
                MU
              </div>
              <div>
                <span className="text-[9px] font-mono font-black text-[#005F73] uppercase tracking-wider block">
                  PRODUCT SPECIFICATION SHEET & INSIGHTS
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#111111] font-display uppercase tracking-tight line-clamp-1">
                  {currentSlot.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isAvailable && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-black bg-emerald-300 text-[#111111] border border-[#111111]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                  AVAILABLE ({currentSlot.inventoryQuantity} UNITS)
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 max-h-[82vh]">
            
            {/* LEFT COLUMN: IMAGE CAROUSEL (col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
              
              <div className="space-y-3">
                {/* Main Display Image Frame with Controls */}
                <div className="relative w-full h-56 sm:h-64 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] overflow-hidden group">
                  <img
                    src={images[selectedImageIndex]}
                    alt={currentSlot.title}
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
                  {currentSlot.merchant.storeLogo && (
                    <img
                      src={currentSlot.merchant.storeLogo}
                      alt={currentSlot.merchant.name}
                      className="w-8 h-8 object-cover border border-[#111111]"
                    />
                  )}
                  <div>
                    <span className="text-[9px] font-mono font-black text-[#005F73] uppercase">APPROVED VENDOR STORE</span>
                    <h4 className="text-xs font-black text-[#111111] font-display uppercase">{currentSlot.merchant.name}</h4>
                    <p className="text-[10px] font-mono text-[#2B2D42] font-bold">{currentSlot.merchant.myshopifyDomain}</p>
                  </div>
                </div>

                <a
                  href={`https://${currentSlot.merchant.myshopifyDomain}`}
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
                      {formatCurrency(currentVariant.price, currentVariant.currencyCode || currentSlot.currencyCode || "INR")}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 bg-[#FFB703] text-[#111111] border border-[#111111] font-mono text-xs font-black uppercase">
                    {currentSlot.category}
                  </span>
                </div>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs border-b-2 border-[#111111] pb-2">
                  <button
                    onClick={() => setActiveTab("specs")}
                    className={`px-3 py-1.5 font-black uppercase border-2 border-[#111111] text-[11px] transition-all ${
                      activeTab === "specs"
                        ? "bg-[#111111] text-white shadow-[2px_2px_0px_#FFB703]"
                        : "bg-white text-[#111111] hover:bg-[#FFB703]"
                    }`}
                  >
                    Specs
                  </button>
                  <button
                    onClick={() => setActiveTab("shopify")}
                    className={`px-3 py-1.5 font-black uppercase border-2 border-[#111111] text-[11px] transition-all ${
                      activeTab === "shopify"
                        ? "bg-[#111111] text-white shadow-[2px_2px_0px_#FFB703]"
                        : "bg-white text-[#111111] hover:bg-[#FFB703]"
                    }`}
                  >
                    Inventory
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
                    <span>Logs ({currentSlot.syncLogs.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("recommendations")}
                    className={`px-3 py-1.5 font-black uppercase border-2 border-[#111111] text-[11px] flex items-center gap-1.5 transition-all ${
                      activeTab === "recommendations"
                        ? "bg-[#111111] text-[#FFB703] shadow-[2px_2px_0px_#D62828]"
                        : "bg-[#FFB703] text-[#111111] hover:bg-[#111111] hover:text-white"
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-[#D62828] fill-[#D62828]" />
                    <span>💡 Recommendations</span>
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
                        {currentSlot.description}
                      </p>
                    </div>

                    {/* Variant Selection */}
                    {currentSlot.variants && currentSlot.variants.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-mono font-bold text-[#111111] uppercase tracking-wider mb-1">
                          Available Variants ({currentSlot.variants.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {currentSlot.variants.map((v) => (
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
                                  {formatCurrency(v.price, v.currencyCode || currentSlot.currencyCode || "INR")}
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
                        {currentSlot.tags.map((t) => (
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
                          {currentSlot.shopifyProductId}
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
                          {currentSlot.variants.map((v) => (
                            <tr key={v.id} className="hover:bg-[#F4F4F0] transition-colors">
                              <td className="p-2 font-black text-[#111111]">{v.title}</td>
                              <td className="p-2 text-[#2B2D42]">{v.sku}</td>
                              <td className="p-2 text-[#D62828] font-black">
                                {formatCurrency(v.price, v.currencyCode || currentSlot.currencyCode || "INR")}
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
                    {currentSlot.syncLogs.map((log) => (
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

                {/* TAB 4: RECOMMENDATION PANEL */}
                {activeTab === "recommendations" && (
                  <div className="space-y-3.5 font-mono">
                    
                    {/* Performance Score Overview Card */}
                    <div className="bg-[#111111] text-white p-3.5 border-2 border-[#111111] shadow-[3px_3px_0px_#FFB703] flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#FFB703]" />
                          <span className="text-xs font-black text-[#FFB703] uppercase">AI Performance & Margin Engine</span>
                        </div>
                        <p className="text-[10px] text-gray-300 font-semibold mt-1">
                          Calculated based on real-time marketplace demand, conversion benchmarks & inventory velocity.
                        </p>
                      </div>
                      <div className="bg-[#FFB703] text-[#111111] px-3 py-1.5 border-2 border-white text-center shrink-0">
                        <div className="text-[9px] font-black uppercase">LISTING SCORE</div>
                        <div className="text-lg font-black font-display">94 / 100</div>
                      </div>
                    </div>

                    {/* Recommendation Module 1: Price & Margin Optimization */}
                    <div className="bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600 stroke-[3]" />
                          <h4 className="text-xs font-black text-[#111111] uppercase">Price & Gross Margin Optimization</h4>
                        </div>
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-500 px-2 py-0.5">
                          +8% PROFIT LIFT
                        </span>
                      </div>
                      <p className="text-[11px] text-[#2B2D42] font-semibold leading-snug">
                        Current Price: <span className="font-black text-[#111111]">{formatCurrency(currentSlot.price, currentSlot.currencyCode || "INR")}</span> → Recommended Benchmark: <span className="font-black text-emerald-700">{formatCurrency(Math.round(currentSlot.price * 1.08), currentSlot.currencyCode || "INR")}</span>. Category demand is high.
                      </p>
                      <button
                        onClick={handleApplyPriceOptimization}
                        className="w-full py-1.5 px-3 bg-[#111111] hover:bg-emerald-600 text-white font-mono text-[11px] font-black uppercase flex items-center justify-center gap-2 border border-[#111111] transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-[#FFB703]" />
                        <span>Apply Recommended Price ({formatCurrency(Math.round(currentSlot.price * 1.08), currentSlot.currencyCode || "INR")})</span>
                      </button>
                    </div>

                    {/* Recommendation Module 2: Inventory Stock Intelligence */}
                    <div className="bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PackageCheck className="w-4 h-4 text-[#005F73] stroke-[2.5]" />
                          <h4 className="text-xs font-black text-[#111111] uppercase">Inventory & Stock Health Alert</h4>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 border ${
                          currentSlot.inventoryQuantity < 10
                            ? "bg-amber-100 text-amber-900 border-amber-500"
                            : "bg-blue-100 text-blue-900 border-blue-500"
                        }`}>
                          {currentSlot.inventoryQuantity < 10 ? "LOW STOCK WARN" : "OPTIMAL VELOCITY"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#2B2D42] font-semibold leading-snug">
                        Available Stock: <span className="font-black text-[#111111]">{currentSlot.inventoryQuantity} Units</span>. Projected stockout window: ~4 days based on view rate.
                      </p>
                      <button
                        onClick={handleSimulateRestock}
                        className="w-full py-1.5 px-3 bg-[#005F73] hover:bg-[#111111] text-white font-mono text-[11px] font-black uppercase flex items-center justify-center gap-2 border border-[#111111] transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-[#FFB703]" />
                        <span>Simulate Restock (+25 Units)</span>
                      </button>
                    </div>

                    {/* Recommendation Module 3: Tag & SEO Enhancement */}
                    <div className="bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-4 h-4 text-[#D62828] stroke-[2.5]" />
                          <h4 className="text-xs font-black text-[#111111] uppercase">SEO & Category Tag Enhancement</h4>
                        </div>
                        <span className="text-[9px] font-black bg-purple-100 text-purple-900 border border-purple-500 px-2 py-0.5">
                          DISCOVERABILITY BOOST
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {["bestseller", "trending2026", "verified-stock"].map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-[#F4F4F0] border border-[#111111] text-[10px] font-bold text-[#111111]">
                            +#{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={handleAutoOptimizeTags}
                        className="w-full py-1.5 px-3 bg-[#D62828] hover:bg-[#111111] text-white font-mono text-[11px] font-black uppercase flex items-center justify-center gap-2 border border-[#111111] transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#FFB703]" />
                        <span>Auto-Optimize Tags</span>
                      </button>
                    </div>

                    {/* Recommendation Module 4: Frequently Bought Together / Cross-Sell */}
                    {relatedListings.length > 0 && (
                      <div className="bg-white p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Flame className="w-4 h-4 text-orange-600 stroke-[2.5]" />
                            <h4 className="text-xs font-black text-[#111111] uppercase">Frequently Bought Together</h4>
                          </div>
                          <span className="text-[9px] font-black bg-[#FFB703] text-[#111111] border border-[#111111] px-2 py-0.5">
                            CROSS-SELL BUNDLE
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {relatedListings.map((rel) => (
                            <div
                              key={rel.id}
                              onClick={() => {
                                if (onSelectRelatedSlot) {
                                  onSelectRelatedSlot(rel);
                                } else {
                                  setCurrentSlot(rel);
                                }
                              }}
                              className="p-2 border border-[#111111] bg-[#F4F4F0] hover:bg-[#FFB703]/20 cursor-pointer transition-colors flex items-center gap-2"
                            >
                              {rel.images && rel.images[0] && (
                                <img src={rel.images[0]} alt={rel.title} className="w-10 h-10 object-cover border border-[#111111] shrink-0" />
                              )}
                              <div className="overflow-hidden">
                                <div className="text-[10px] font-black text-[#111111] uppercase truncate">{rel.title}</div>
                                <div className="text-[10px] font-mono text-[#D62828] font-black">
                                  {formatCurrency(rel.price, rel.currencyCode || "INR")}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Bottom Sticky CTA Action Buttons */}
              <div className="pt-3 border-t-2 border-[#111111] flex flex-wrap items-center gap-2.5">
                {currentSlot.merchant.whatsappNumber && (
                  <a
                    href={`https://wa.me/${currentSlot.merchant.whatsappNumber}?text=${encodeURIComponent(
                      `Hi! I found "${currentSlot.title}" (Variant: ${currentVariant.title}, SKU: ${
                        currentVariant.sku || currentSlot.sku
                      }, Price: ${formatCurrency(currentVariant.price, currentVariant.currencyCode || currentSlot.currencyCode || "INR")}) on Masters' Union Marketplace. I would like to inquire about purchasing this item: ${
                        currentSlot.productUrl || `https://${currentSlot.merchant.myshopifyDomain}`
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
                  href={currentSlot.productUrl || `https://${currentSlot.merchant.myshopifyDomain}`}
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



