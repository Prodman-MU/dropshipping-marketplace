"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Sparkles, Layers } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-8 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      <div className="relative glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Tech Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>DE LOREAN RESERVATION SYSTEM • PRODUCT MARKETPLACE</span>
        </motion.div>

        {/* Main Editorial Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl"
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] uppercase font-sans">
            Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">Shopify Product Slots</span> Catalog
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Directly synced product slots aggregated from verified Shopify Storefront APIs with real-time stock tracking, variant options, and webhook synchronization.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
