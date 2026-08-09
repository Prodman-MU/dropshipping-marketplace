"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Store,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  ExternalLink,
  Tag,
  RefreshCw,
} from "lucide-react";
import { MerchantVendor, SlotListing } from "@/data/mock-slots";
import { formatCurrency } from "@/lib/utils";

interface AdminModerationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: MerchantVendor[];
  slots: SlotListing[];
  onApproveStore: (merchantId: string) => void;
  onRejectStore: (merchantId: string) => void;
}

export function AdminModerationDrawer({
  isOpen,
  onClose,
  merchants,
  slots,
  onApproveStore,
  onRejectStore,
}: AdminModerationDrawerProps) {
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "REJECTED">("PENDING");
  const [expandedMerchantId, setExpandedMerchantId] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingCount = merchants.filter((m) => m.status === "PENDING").length;
  const activeCount = merchants.filter((m) => m.status === "ACTIVE").length;
  const rejectedCount = merchants.filter((m) => m.status === "REJECTED").length;

  const filteredMerchants = merchants.filter((m) => {
    if (activeFilter === "PENDING") return m.status === "PENDING";
    if (activeFilter === "ACTIVE") return m.status === "ACTIVE";
    if (activeFilter === "REJECTED") return m.status === "REJECTED";
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedMerchantId(expandedMerchantId === id ? null : id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        >
          <div className="w-screen max-w-3xl bg-[#121216] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Top Fixed Header */}
            <div className="p-6 border-b border-white/10 bg-black/90 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight font-sans">
                      Shopify Integration Admin Moderation
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono">
                      Review, inspect fetched catalog items, and Approve or Reject connected Shopify stores.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 mt-5 font-mono text-xs">
                <button
                  onClick={() => setActiveFilter("PENDING")}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeFilter === "PENDING"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  <span>Pending Approval</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-amber-300 text-[10px]">
                    {pendingCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter("ACTIVE")}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeFilter === "ACTIVE"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  <span>Active Stores</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-amber-300 text-[10px]">
                    {activeCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter("REJECTED")}
                  className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeFilter === "REJECTED"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  <span>Rejected</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-amber-300 text-[10px]">
                    {rejectedCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeFilter === "ALL"
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
                  }`}
                >
                  All ({merchants.length})
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => {
                  const storeSlots = slots.filter((s) => s.merchant.id === merchant.id);
                  const isExpanded = expandedMerchantId === merchant.id || activeFilter === "PENDING";

                  return (
                    <div
                      key={merchant.id}
                      className="p-5 rounded-2xl bg-black/70 border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-xl"
                    >
                      {/* Store Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={merchant.storeLogo}
                            alt={merchant.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white tracking-wide">
                                {merchant.name}
                              </h3>
                              {merchant.status === "PENDING" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  PENDING APPROVAL
                                </span>
                              )}
                              {merchant.status === "ACTIVE" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  APPROVED & ACTIVE
                                </span>
                              )}
                              {merchant.status === "REJECTED" && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                  REJECTED
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1 text-xs font-mono text-zinc-400">
                              <span className="flex items-center gap-1 text-zinc-300">
                                <Store className="w-3.5 h-3.5 text-amber-400" />
                                {merchant.myshopifyDomain}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Package className="w-3.5 h-3.5 text-zinc-500" />
                                {storeSlots.length} Synced Products
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Approve / Reject / Preview Toggle */}
                        <div className="flex items-center gap-2">
                          {merchant.status !== "ACTIVE" && (
                            <button
                              onClick={() => onApproveStore(merchant.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Integration</span>
                            </button>
                          )}

                          {merchant.status !== "REJECTED" && (
                            <button
                              onClick={() => onRejectStore(merchant.id)}
                              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => toggleExpand(merchant.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                            title="Toggle product catalog preview"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Fetched Product Preview List */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-white/10 space-y-3">
                          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Fetched Product Catalog Items ({storeSlots.length})</span>
                            <span className="text-[11px] text-amber-400">Photos, Descriptions & Specs</span>
                          </h4>

                          {storeSlots.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {storeSlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className="p-3 rounded-xl bg-[#121216] border border-white/10 flex gap-3 overflow-hidden"
                                >
                                  {slot.images && slot.images[0] && (
                                    <img
                                      src={slot.images[0]}
                                      alt={slot.title}
                                      className="w-16 h-16 rounded-lg object-cover border border-white/10 shrink-0"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                                        {slot.slotNumber}
                                      </span>
                                      <span className="text-xs font-mono font-bold text-white">
                                        {formatCurrency(slot.price)}
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-white truncate">
                                      {slot.title}
                                    </h5>
                                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight font-sans">
                                      {slot.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-white/5 text-center font-mono text-xs text-zinc-400">
                              No catalog items synced for this store yet.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center space-y-3 bg-black/60 rounded-2xl border border-white/10">
                  <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Stores Found</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    No Shopify store integrations match the selected filter ({activeFilter}).
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="p-4 border-t border-white/10 bg-black/90 backdrop-blur-md flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Stage 1 Shopify Integration Protocol Active</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
              >
                Close Panel
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
