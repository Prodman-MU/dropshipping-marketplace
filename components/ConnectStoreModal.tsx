/**
 * @file ConnectStoreModal.tsx
 * @description Apple Store Minimalist Shopify Store Connection Modal.
 * 
 * Features:
 * - Frosted backdrop with smooth spring scaling
 * - Clean input styling with hairline borders
 * - Subtle verification status feedback
 * - Matte black pill submit button
 */

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-700 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-1 pr-8 mb-6">
              <span className="font-mono text-[11px] font-semibold text-neutral-500 uppercase tracking-widest block">
                SHOPIFY INTEGRATION
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-neutral-950 font-normal">
                Link Shopify Store
              </h3>
              <p className="text-xs text-neutral-600">
                Connect your storefront to sync live inventory and product catalog items.
              </p>
            </div>

            {success ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <div className="space-y-1">
                  <h4 className="text-lg font-semibold text-neutral-950">
                    Store Connected!
                  </h4>
                  <p className="text-xs text-neutral-600 max-w-sm">
                    Fetched products and inventory for <span className="font-medium text-black">{domain}</span>.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Shopify Domain *
                  </label>
                  <input
                    type="text"
                    placeholder="mybrand.myshopify.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Store Passcode *</span>
                    <span className="text-[10px] text-neutral-400 lowercase">for vendor portal</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Create portal login passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Storefront Access Token (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                    Vendor WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 focus:outline-none transition"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="pill-btn-secondary px-4 py-2.5 text-xs font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !domain || !passcode}
                    className="pill-btn-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect Store</span>
                        <ArrowRight className="w-3.5 h-3.5" />
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
