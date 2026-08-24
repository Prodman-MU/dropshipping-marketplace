/**
 * @file StoreStatusModal.tsx
 * @description Apple Store Minimalist Store Approval & Status Modal.
 * 
 * Features:
 * - Frosted backdrop with smooth spring scaling
 * - Clean tab switcher with pill indicators
 * - Minimalist store search and live status badges
 * - Matte black pill action buttons
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Store, Clock, CheckCircle2, AlertCircle, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { MerchantVendor } from "@/data/mock-slots";
import { cleanStoreDomain, isSameStoreDomain } from "@/lib/utils";

interface StoreStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: MerchantVendor[];
  onAddStore: (domain: string, token?: string, whatsapp?: string, passcode?: string) => Promise<void>;
}

export function StoreStatusModal({
  isOpen,
  onClose,
  merchants,
  onAddStore,
}: StoreStatusModalProps) {
  const [activeTab, setActiveTab] = useState<"lookup" | "connect">("lookup");
  const [searchDomain, setSearchDomain] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanedSearch = cleanStoreDomain(searchDomain);
  const rawSearch = searchDomain.trim().toLowerCase();

  const filteredMerchants = merchants.filter((m) => {
    if (!searchDomain.trim()) return false;
    
    const merchantDomainClean = cleanStoreDomain(m.myshopifyDomain);
    const merchantDomainPrefix = merchantDomainClean.replace(".myshopify.com", "").replace(/^www\./, "");
    const merchantNameClean = m.name.toLowerCase().trim();

    return (
      isSameStoreDomain(searchDomain, m.myshopifyDomain) ||
      merchantDomainClean.includes(cleanedSearch) ||
      (cleanedSearch.length >= 3 && merchantDomainClean.includes(cleanedSearch)) ||
      (cleanedSearch.length >= 3 && cleanedSearch.includes(merchantDomainPrefix)) ||
      merchantNameClean.includes(rawSearch) ||
      (cleanedSearch.length >= 3 && merchantNameClean.includes(cleanedSearch)) ||
      (m.whatsappNumber && m.whatsappNumber.includes(rawSearch))
    );
  });

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDomain = cleanStoreDomain(newDomain);
    if (!targetDomain || !passcode.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await onAddStore(
        targetDomain,
        accessToken.trim() || undefined,
        whatsappNumber.trim() || undefined,
        passcode.trim() || undefined
      );
      setSubmitSuccess(true);
      setNewDomain("");
      setWhatsappNumber("");
      setAccessToken("");
      setPasscode("");
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab("lookup");
      }, 1800);
    } catch (err: any) {
      console.error("Store connect error in StoreStatusModal:", err);
      setSubmitError(err.message || "Storefront reachability error. Could not connect site.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Frosted Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="relative bg-white rounded-3xl border border-neutral-200/80 max-w-xl w-full p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
        >
          
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Title Header */}
          <div className="mb-6 space-y-1 pr-8">
            <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest block">
              SUPPLIER MODERATION
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl text-neutral-950 font-normal">
              Store Verification Status
            </h2>
            <p className="text-xs text-neutral-600">
              Check live verification status or submit your Shopify store for catalog approval.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex p-1 rounded-full bg-neutral-100 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("lookup")}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTab === "lookup"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              Check Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("connect")}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTab === "connect"
                  ? "bg-white text-black shadow-xs"
                  : "text-neutral-600 hover:text-black"
              }`}
            >
              Connect Store
            </button>
          </div>

          {/* TAB 1: LOOKUP STATUS */}
          {activeTab === "lookup" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Enter store name or domain..."
                  value={searchDomain}
                  onChange={(e) => setSearchDomain(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {!searchDomain.trim() ? (
                  <div className="p-8 rounded-2xl bg-[#F8F9FA] border border-dashed border-neutral-200 text-center space-y-2">
                    <Store className="w-6 h-6 text-neutral-400 mx-auto" />
                    <h4 className="text-xs font-semibold text-neutral-800">Search Your Store</h4>
                    <p className="text-[11px] text-neutral-500">
                      Type your domain prefix to check live verification status.
                    </p>
                  </div>
                ) : filteredMerchants.length > 0 ? (
                  filteredMerchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-neutral-200/70 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-xs text-neutral-950">
                          {merchant.name}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-500">
                          {merchant.myshopifyDomain}
                        </div>
                      </div>

                      <div>
                        {merchant.status === "ACTIVE" && (
                          <span className="status-pill bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                            Approved & Live
                          </span>
                        )}
                        {merchant.status === "PENDING" && (
                          <span className="status-pill bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                            Pending Review
                          </span>
                        )}
                        {merchant.status === "REJECTED" && (
                          <span className="status-pill bg-red-50 text-red-800 border-red-200 text-[10px]">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-2xl bg-[#F8F9FA] text-center space-y-3">
                    <p className="text-xs text-neutral-600">
                      No store submission found matching "{searchDomain}".
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setNewDomain(cleanStoreDomain(searchDomain));
                        setActiveTab("connect");
                      }}
                      className="pill-btn-primary px-4 py-2 text-xs font-medium"
                    >
                      Submit Store Now
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span>Submitted Stores: {merchants.length}</span>
                <button
                  type="button"
                  onClick={() => setActiveTab("connect")}
                  className="text-black font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Connect a new store</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONNECT STORE FORM */}
          {activeTab === "connect" && (
            <form onSubmit={handleConnectSubmit} className="space-y-4">
              {submitSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Store submitted successfully! Pending admin approval.</span>
                </div>
              )}

              {submitError && (
                <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-neutral-700">
                  Shopify Store Domain *
                </label>
                <input
                  type="text"
                  required
                  placeholder="mybrand.myshopify.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-neutral-700 flex items-center justify-between">
                  <span>Store Vendor Passcode *</span>
                  <span className="text-[10px] text-neutral-400 lowercase">for vendor portal</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create vendor login passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-neutral-700">
                  Vendor WhatsApp Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase tracking-wider mb-1 text-neutral-700">
                  Storefront Access Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="shpat_xxxxxxxx"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="pill-btn-secondary px-4 py-2.5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newDomain.trim() || !passcode.trim()}
                  className="pill-btn-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
                >
                  {isSubmitting ? "Submitting..." : "Submit Store"}
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
