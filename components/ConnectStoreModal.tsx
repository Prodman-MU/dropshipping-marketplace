"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { cleanStoreDomain } from "@/lib/utils";

interface ConnectStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (domain: string, token?: string, whatsappNumber?: string, passcode?: string) => Promise<void> | void;
}

export function ConnectStoreModal({ isOpen, onClose, onConnect }: ConnectStoreModalProps) {
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDom = cleanStoreDomain(domain);
    if (!cleanDom) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onConnect(cleanDom, token, whatsappNumber, passcode);
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDomain("");
        setToken("");
        setWhatsappNumber("");
        setPasscode("");
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Store connect error:", err);
      setIsSubmitting(false);
      setErrorMessage(err.message || "Invalid store domain or storefront verification failed.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Bauhaus Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-white border-4 border-[#111111] p-6 sm:p-8 shadow-[10px_10px_0px_#111111] z-10 my-8 overflow-hidden font-mono text-[#111111]"
          >
            {/* Top Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#FFB703] border-b-2 border-[#111111]" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-[#FFB703] border-2 border-[#111111] hover:bg-[#D62828] hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b-2 border-[#111111] mt-2">
              <div className="w-12 h-12 bg-[#FFB703] border-2 border-[#111111] flex items-center justify-center text-[#111111] shadow-[3px_3px_0px_#111111] shrink-0">
                <Store className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#111111] font-display uppercase tracking-tight">
                  Link Shopify Store
                </h3>
                <p className="text-xs text-[#2B2D42] font-mono font-bold">
                  Connect & Sync Storefront Catalog Items
                </p>
              </div>
            </div>

            {success ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-14 h-14 bg-[#005F73] text-white border-2 border-[#111111] flex items-center justify-center shadow-[4px_4px_0px_#111111]"
                >
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </motion.div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-[#111111] font-display uppercase">
                    Store Linked & Products Synced!
                  </h4>
                  <p className="text-xs text-[#2B2D42] font-mono font-bold max-w-sm">
                    Fetched products and variants for <span className="text-[#D62828] font-black">{domain}</span>.
                  </p>
                </div>
                <div className="p-3 bg-[#005F73] text-white border-2 border-[#111111] text-xs font-mono font-bold shadow-[3px_3px_0px_#111111]">
                  ✓ Integration complete! Products now visible in moderation panel.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-[#D62828]/10 border-2 border-[#D62828] text-[#D62828] text-xs font-mono font-bold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#D62828] mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. Shopify Site Domain */}
                <div>
                  <label className="block text-xs font-mono font-black text-[#111111] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>1. Shopify Site Name / Domain *</span>
                    <span className="px-2 py-0.5 text-[10px] bg-[#FFB703] text-[#111111] border border-[#111111]">REQUIRED</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. apex-gear or apex-gear.myshopify.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-sm text-[#111111] font-mono font-bold placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-[#FFB703] transition-all"
                  />
                </div>

                {/* 2. Store Vendor Passcode */}
                <div>
                  <label className="block text-xs font-mono font-black text-[#111111] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>2. Set Store Passcode *</span>
                    <span className="px-2 py-0.5 text-[10px] bg-[#FFB703] text-[#111111] border border-[#111111]">REQUIRED</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Create passcode for store owner (e.g. apex123)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-sm text-[#111111] font-mono font-bold placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-[#FFB703] transition-all"
                  />
                  <p className="text-[11px] text-[#2B2D42] mt-1 font-mono font-bold">
                    🔑 Passcode used by store owner to login to the /vendor portal desk.
                  </p>
                </div>

                {/* 3. Optional Storefront Token */}
                <div>
                  <label className="block text-xs font-mono font-black text-[#111111] uppercase tracking-wider mb-1.5">
                    Storefront API Access Token (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-sm text-[#111111] font-mono font-bold placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-[#FFB703] transition-all"
                  />
                  <p className="text-[11px] text-[#2B2D42] mt-1 font-mono font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#005F73]" />
                    Webhooks for inventory_levels/update & products/update auto-configured.
                  </p>
                </div>

                {/* 4. Optional WhatsApp Number */}
                <div>
                  <label className="block text-xs font-mono font-black text-[#111111] uppercase tracking-wider mb-1.5">
                    WhatsApp Owner Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210 or +1 555 123 4567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full bg-[#F4F4F0] border-2 border-[#111111] px-4 py-2.5 text-sm text-[#111111] font-mono font-bold placeholder-zinc-500 focus:outline-none focus:bg-white focus:border-[#FFB703] transition-all"
                  />
                  <p className="text-[11px] text-[#2B2D42] mt-1 font-mono font-bold">
                    Enables direct 1-click WhatsApp purchase inquiries for customers. Include country code.
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 flex items-center justify-between gap-3 border-t-2 border-[#111111]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-[#E5E5E0] text-[#111111] border-2 border-[#111111] font-mono text-xs font-black uppercase hover:bg-[#D62828] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !domain || !passcode}
                    className="px-5 py-2.5 bg-[#FFB703] text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase flex items-center gap-2 shadow-[3px_3px_0px_#111111] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Store...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect & Sync Store</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
