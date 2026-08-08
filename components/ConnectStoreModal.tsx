"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

interface ConnectStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (domain: string) => void;
}

export function ConnectStoreModal({ isOpen, onClose, onConnect }: ConnectStoreModalProps) {
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onConnect(domain);
        setSuccess(false);
        setDomain("");
        setToken("");
        onClose();
      }, 1200);
    }, 1500);
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
            className="absolute inset-0 bg-[#090A0F]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg bg-[#13151D] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
          >
            {/* Top Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Connect Shopify Store</h3>
                  <p className="text-xs text-zinc-400 font-mono">Sync Storefront Catalog & Webhooks</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                <h4 className="text-xl font-bold text-white">Store Connected Successfully!</h4>
                <p className="text-sm text-zinc-400 font-mono">
                  Catalog slots synced for {domain}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Shopify Domain (*.myshopify.com)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. brand-store.myshopify.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      required
                      className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Storefront API Access Token (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-[#090A0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Webhooks for inventory_levels/update & products/update will be automatically configured.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !domain}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying OAuth...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect & Sync Catalog</span>
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
