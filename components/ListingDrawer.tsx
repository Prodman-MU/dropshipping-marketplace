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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-start pl-8 sm:pl-16 md:pl-24 cursor-pointer"
        >
          {/* Clickable Shopify Merchant Store Popout Showcase */}
          <motion.a
            href={`https://${slot.merchant.myshopifyDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex flex-col items-center gap-4 p-8 rounded-3xl bg-black/70 border border-white/10 hover:border-amber-500/50 backdrop-blur-xl shadow-2xl max-w-xs text-center group cursor-pointer transition-all hover:scale-105"
            title={`Click to open ${slot.merchant.name} live Shopify store`}
          >
            <div className="relative">
              <img
                src={slot.merchant.storeLogo}
                alt={slot.merchant.name}
                className="w-36 h-36 object-cover rounded-2xl shadow-2xl shadow-amber-500/20 border border-white/10 group-hover:border-amber-400/60 transition-all filter brightness-105"
              />
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center shadow-md">
                <ExternalLink className="w-3.5 h-3.5 text-black font-bold" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-xl font-bold text-white tracking-wide font-sans group-hover:text-amber-300 transition-colors">
                  {slot.merchant.name}
                </h3>
                <ExternalLink className="w-4 h-4 text-amber-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5 group-hover:text-zinc-200">
                {slot.merchant.myshopifyDomain}
              </p>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-block mt-2 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                VISIT SHOPIFY STOREFRONT ↗
              </span>
            </div>

            <p className="text-[11px] font-mono text-zinc-500 group-hover:text-amber-400/80 transition-colors">
              Click logo to open store in new tab
            </p>
          </motion.a>
        </motion.div>

        {/* Slide-over Drawer Panel on the Right */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        >
          <div className="w-screen max-w-2xl bg-[#121216] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Top Fixed Header */}
            <div className="p-6 border-b border-white/10 bg-black/90 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {/* Masters Union Animated Logo */}
                  <img
                    src="/assets/logoanimationblack.gif"
                    alt="Masters Union"
                    className="h-9 w-auto max-w-[160px] object-contain rounded-lg"
                  />
                  <div className="h-4 w-px bg-white/15 hidden sm:block" />
                  <div className="flex items-center gap-2.5">
                    {isAvailable && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        AVAILABLE
                      </span>
                    )}
                    {isReserved && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        RESERVED
                      </span>
                    )}
                    {isSold && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        SOLD OUT
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {slot.title}
              </h2>

              <div className="flex items-center gap-2 mt-2 text-xs font-mono text-zinc-400">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Vendor Store:</span>
                <span className="text-white font-bold">{slot.merchant.name}</span>
                <span>({slot.merchant.myshopifyDomain})</span>
              </div>

              {/* Drawer Tabs */}
              <div className="flex items-center gap-2 mt-6 pt-2 border-t border-white/10 font-mono text-xs">
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    activeTab === "specs"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                  }`}
                >
                  Product Specs
                </button>
                <button
                  onClick={() => setActiveTab("shopify")}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    activeTab === "shopify"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                  }`}
                >
                  Shopify & Inventory
                </button>
                <button
                  onClick={() => setActiveTab("webhooks")}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === "webhooks"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Sync Logs ({slot.syncLogs.length})</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: PRODUCT SPECS */}
              {activeTab === "specs" && (
                <div className="space-y-6">
                  {/* Image Gallery */}
                  {slot.images && slot.images.length > 0 && (
                    <div>
                      <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black border border-white/10 mb-3">
                        <img
                          src={slot.images[selectedImageIndex] || slot.images[0]}
                          alt={slot.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {slot.images.length > 1 && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                          {slot.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                                selectedImageIndex === idx
                                  ? "border-amber-400 scale-105"
                                  : "border-white/10 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img src={img} alt="thumb" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                      Product Overview & Details
                    </h4>
                    <p className="text-sm text-zinc-300 leading-relaxed bg-black/60 p-4 rounded-xl border border-white/5 font-sans">
                      {slot.description}
                    </p>
                  </div>

                  {/* Variant Selection */}
                  {slot.variants && slot.variants.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                        Select Variant Options
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {slot.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`p-3 rounded-xl border text-left font-mono transition-all ${
                              currentVariant.id === v.id
                                ? "bg-amber-500/10 border-amber-500/40 text-white"
                                : "bg-black/60 border-white/10 text-zinc-400 hover:text-white"
                            }`}
                          >
                            <div className="text-xs font-bold text-white">{v.title}</div>
                            <div className="flex items-center justify-between mt-1 text-[11px]">
                              <span>SKU: {v.sku}</span>
                              <span className="text-amber-400 font-bold">{formatCurrency(v.price)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category & Tag Pills */}
                  <div>
                    <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                      Category & Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono">
                        {slot.category}
                      </span>
                      {slot.tags.map((t) => (
                        <span key={t} className="px-3 py-1 rounded-lg bg-white/5 text-zinc-400 border border-white/10 text-xs font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SHOPIFY & INVENTORY */}
              {activeTab === "shopify" && (
                <div className="space-y-6">
                  {/* Shopify API Metadata Box */}
                  <div className="bg-black/80 p-5 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      <span>SHOPIFY STOREFRONT GRAPHQL IDENTIFIERS</span>
                    </h4>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Shopify Product GID</span>
                        <span className="text-white bg-black/90 px-3 py-1.5 rounded-lg border border-white/10 block mt-1 break-all">
                          {slot.shopifyProductId}
                        </span>
                      </div>

                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Selected Variant GID</span>
                        <span className="text-white bg-black/90 px-3 py-1.5 rounded-lg border border-white/10 block mt-1 break-all">
                          {currentVariant.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Stock SKU</span>
                          <span className="text-amber-400 font-bold">{currentVariant.sku}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase">Available Inventory</span>
                          <span className="text-white font-bold">{currentVariant.inventoryQuantity} Units</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* All Variants Table */}
                  <div>
                    <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">
                      Complete Variant Catalog Inventory
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-white/5 text-zinc-400 uppercase border-b border-white/10">
                          <tr>
                            <th className="p-3">Variant Title</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-black/60">
                          {slot.variants.map((v) => (
                            <tr key={v.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 font-bold text-white">{v.title}</td>
                              <td className="p-3 text-zinc-400">{v.sku}</td>
                              <td className="p-3 text-amber-400 font-bold">{formatCurrency(v.price)}</td>
                              <td className="p-3 text-zinc-300">{v.inventoryQuantity} Units</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WEBHOOK SYNC LOGS */}
              {activeTab === "webhooks" && (
                <div className="space-y-6">
                  <div className="bg-black/80 p-5 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          REAL-TIME SHOPIFY WEBHOOK LOGS
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                        HMAC VERIFIED
                      </span>
                    </div>

                    {/* Logs Timeline */}
                    <div className="space-y-3 font-mono text-xs">
                      {slot.syncLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 rounded-xl bg-[#121216] border border-white/10 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                              {log.eventType}
                            </span>
                            <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {log.timestamp}
                            </span>
                          </div>
                          <p className="text-zinc-300 text-xs">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Sticky Action Footer */}
            <div className="p-6 border-t border-white/10 bg-black/90 backdrop-blur-md flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Selected Price</span>
                <span className="text-2xl font-black text-white font-mono">
                  {formatCurrency(currentVariant.price)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={slot.productUrl || `https://${slot.merchant.myshopifyDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-bold text-sm flex items-center gap-2 hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy on Shopify Storefront</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
