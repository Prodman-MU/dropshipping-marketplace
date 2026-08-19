"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { SlotListing, MerchantVendor } from "@/data/mock-slots";
import { getInitialSlots, getInitialMerchants } from "@/lib/store-manager";
import { formatCurrency } from "@/lib/utils";
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/settings-manager";
import {
  ArrowLeft,
  ExternalLink,
  ShoppingBag,
  Store,
  ShieldCheck,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [slots, setSlots] = useState<SlotListing[]>([]);
  const [merchants, setMerchants] = useState<MerchantVendor[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  useEffect(() => {
    setSlots(getInitialSlots());
    setMerchants(getInitialMerchants());
    setSiteSettings(getSiteSettings());

    const handleStateChange = () => {
      setSlots(getInitialSlots());
      setMerchants(getInitialMerchants());
    };
    window.addEventListener("store-state-changed", handleStateChange);
    return () => window.removeEventListener("store-state-changed", handleStateChange);
  }, []);

  const slot = useMemo(() => {
    if (!productId) return null;
    return slots.find((s) => s.id === productId || s.slotNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() === productId.toLowerCase()) || null;
  }, [slots, productId]);

  const relatedSlots = useMemo(() => {
    if (!slot) return [];
    return slots.filter((s) => s.id !== slot.id && (s.category === slot.category || s.merchant.id === slot.merchant.id)).slice(0, 4);
  }, [slots, slot]);

  if (!slot) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex flex-col font-sans">
        <Header activeVendorCount={merchants.filter((m) => m.status === "ACTIVE").length} totalSyncedProducts={slots.length} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white border-4 border-[#111111] p-10 max-w-md w-full text-center space-y-4 shadow-[8px_8px_0px_#111111]">
            <div className="w-16 h-16 bg-[#FFB703] border-2 border-[#111111] flex items-center justify-center mx-auto text-2xl font-black">
              🔍
            </div>
            <h2 className="text-xl font-black text-[#111111] uppercase font-display">Product Not Found</h2>
            <p className="text-xs font-semibold text-[#2B2D42]">
              The requested catalog product slot could not be located or may have been removed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] text-white font-mono font-black text-xs uppercase border-2 border-[#111111] hover:bg-[#D62828] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const images = slot.images && slot.images.length > 0
    ? slot.images
    : ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"];

  const mainImage = images[selectedImageIndex] || images[0];
  const variants = slot.variants || [];
  const currentVariant = variants[selectedVariantIndex] || {
    id: "default",
    title: "Default Variant",
    price: slot.price,
    sku: slot.sku,
    inventoryQuantity: slot.inventoryQuantity,
    availableForSale: true,
  };

  const isAvailable = slot.status === "AVAILABLE";
  const isReserved = slot.status === "RESERVED";

  const handleCopySpecs = () => {
    const specsText = `PRODUCT: ${slot.title}\nPRICE: ${formatCurrency(slot.price, slot.currencyCode || "INR")}\nCATEGORY: ${slot.category}\nSKU: ${slot.sku}\nSTORE: ${slot.merchant.name} (${slot.merchant.myshopifyDomain})\nDIRECT CHECKOUT: ${slot.productUrl || `https://${slot.merchant.myshopifyDomain}`}`;
    navigator.clipboard.writeText(specsText);
    setCopiedNotice("Product Specifications copied to clipboard!");
    setTimeout(() => setCopiedNotice(null), 3000);
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
    <div className="min-h-screen bg-[#F4F4F0] flex flex-col font-sans">
      <Header
        showBackButton
        activeVendorCount={merchants.filter((m) => m.status === "ACTIVE").length}
        totalSyncedProducts={slots.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-5 py-6 space-y-6">
        
        {/* Top Action Notice Toast */}
        {copiedNotice && (
          <div className="bg-[#FFB703] text-[#111111] px-4 py-2.5 font-mono text-xs font-black border-4 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-between animate-fadeIn">
            <span>{copiedNotice}</span>
            <button
              onClick={() => setCopiedNotice(null)}
              className="p-1 hover:bg-[#111111] hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="bg-white border-4 border-[#111111] shadow-[10px_10px_0px_#111111] p-4 sm:p-6 lg:p-7">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
            
            {/* COLUMN 1: Image Gallery (5 cols / ~42%) */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-4">
              {/* Main Image Frame */}
              <div className="relative w-full aspect-square sm:aspect-4/3 bg-[#F4F4F0] border-4 border-[#111111] shadow-[6px_6px_0px_#111111] overflow-hidden group">
                <img
                  src={mainImage}
                  alt={slot.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Carousel Prev/Next Overlay Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/95 hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-all"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[3]" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/95 hover:bg-[#FFB703] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-all"
                      title="Next Image"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </>
                )}
              </div>

              {/* Mobile View (< sm): Pagination Dots Indicator */}
              {images.length > 1 && (
                <div className="flex sm:hidden items-center justify-center gap-2 py-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`transition-all ${
                        selectedImageIndex === idx
                          ? "w-6 h-2.5 bg-[#111111] border border-[#111111] rounded-full shadow-[1px_1px_0px_#FFB703]"
                          : "w-2.5 h-2.5 bg-[#D5D5D0] hover:bg-[#111111] border border-[#111111] rounded-full"
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Tablet & Desktop View (sm+): Thumbnails Bar */}
              {images.length > 1 && (
                <div className="hidden sm:flex items-center gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-14 border-2 border-[#111111] shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? "bg-[#FFB703] shadow-[3px_3px_0px_#111111] scale-105"
                          : "opacity-70 hover:opacity-100 bg-white"
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: Title, Variant Selector, Description & Specs (4 cols / ~33%) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* 1. Category & Product Title */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 text-[11px] font-mono font-black uppercase bg-[#005F73] text-white border border-[#111111]">
                    {slot.category}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#111111] font-display uppercase tracking-tight leading-tight">
                  {slot.title}
                </h1>
              </div>

              {/* 2. Variant Selector */}
              {variants.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#111111] uppercase tracking-wider block">
                    Select Variant ({variants.length} Available):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {variants.map((v, idx) => (
                      <button
                        key={v.id || idx}
                        onClick={() => handleSelectVariant(idx)}
                        className={`p-2 border-2 border-[#111111] text-left font-mono text-xs transition-all ${
                          selectedVariantIndex === idx
                            ? "bg-[#111111] text-white shadow-[2px_2px_0px_#FFB703]"
                            : "bg-white text-[#111111] hover:bg-[#F4F4F0]"
                        }`}
                      >
                        <span className="font-black block line-clamp-1 text-[11px]">{v.title}</span>
                        <span className="text-[10px] opacity-80 block">{formatCurrency(v.price, slot.currencyCode || "INR")}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Product Description & Specification */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[10px] font-bold text-[#2B2D42] uppercase block">
                  Product Description & Specification:
                </span>
                <div className="text-zinc-800 leading-relaxed font-sans text-xs sm:text-sm font-semibold bg-[#F4F4F0] p-3.5 sm:p-4 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] min-h-[110px] max-h-72 overflow-y-auto pr-2">
                  <p className="whitespace-pre-line">{slot.description}</p>
                </div>
              </div>

              {/* 4. Product Discovery Tags */}
              {slot.tags && slot.tags.length > 0 && (
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {slot.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#F4F4F0] border border-[#111111] text-[10px] font-mono font-bold text-[#111111]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* COLUMN 3: Sticky Buy Box & Vendor Card (3 cols / ~25%) */}
            <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-24 self-start">
              
              {/* Price & Stock Status Box */}
              <div className="bg-[#FFB703] border-3 border-[#111111] p-3.5 sm:p-4 shadow-[4px_4px_0px_#111111] space-y-2">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-[#111111]">
                      {formatCurrency(currentVariant.price || slot.price, slot.currencyCode || "INR")}
                    </span>
                    {slot.compareAtPrice && slot.compareAtPrice > slot.price && (
                      <span className="text-xs sm:text-sm font-mono text-zinc-700 line-through font-bold">
                        {formatCurrency(slot.compareAtPrice, slot.currencyCode || "INR")}
                      </span>
                    )}
                  </div>

                  {((!slot.isUnknownQuantity && slot.inventoryQuantity <= 0) || slot.status === "SOLD" || !currentVariant.availableForSale) && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-black bg-[#D62828] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] uppercase">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold text-[#111111] block">
                  Retail Price (Taxes Included)
                </span>
              </div>

              {/* Action CTAs for Buying & Inquiries */}
              <div className="space-y-2.5">
                {/* 1st Action: Contact Through WhatsApp */}
                <a
                  href={`https://wa.me/${slot.merchant.whatsappNumber || "919876543210"}?text=${encodeURIComponent(
                    `Hi ${slot.merchant.name}! I want to purchase "${slot.title}" (Variant: ${currentVariant.title}, SKU: ${currentVariant.sku || slot.sku}). Price: ${formatCurrency(currentVariant.price || slot.price, slot.currencyCode || "INR")}. Please share purchase & delivery details.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-3 bg-[#25D366] hover:bg-[#128C7E] text-white border-3 border-[#111111] text-xs font-mono font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_#111111] hover:shadow-[1px_1px_0px_#111111] transition-all uppercase tracking-wider text-center"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>CONTACT / BUY ON WHATSAPP</span>
                </a>

                {/* 2nd Action: Direct Checkout on Shopify Store */}
                {slot.productUrl ? (
                  <a
                    href={slot.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-3 bg-[#111111] hover:bg-[#D62828] text-white border-3 border-[#111111] text-xs font-mono font-black flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#FFB703] hover:shadow-[1px_1px_0px_#FFB703] transition-all uppercase tracking-wider text-center"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#FFB703] shrink-0" />
                    <span>CHECKOUT ON SHOPIFY</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <a
                    href={`https://${slot.merchant.myshopifyDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-3 bg-[#111111] hover:bg-[#D62828] text-white border-3 border-[#111111] text-xs font-mono font-black flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#FFB703] hover:shadow-[1px_1px_0px_#FFB703] transition-all uppercase tracking-wider text-center"
                  >
                    <Store className="w-4 h-4 text-[#FFB703] shrink-0" />
                    <span>VENDOR STOREFRONT</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                )}

                <button
                  onClick={handleCopySpecs}
                  className="w-full py-2 px-3 bg-white hover:bg-[#F4F4F0] text-[#111111] border-2 border-[#111111] font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111111] transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-[#005F73]" />
                  <span>COPY SPECIFICATIONS</span>
                </button>
              </div>

              {/* Fulfilling Vendor Information Box */}
              <div className="bg-white border-3 border-[#111111] p-3.5 shadow-[3px_3px_0px_#111111] space-y-2.5 font-mono">
                <div className="flex items-center justify-between border-b-2 border-[#111111] pb-1.5">
                  <span className="text-[10px] font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#D62828]" />
                    <span>Merchant Vendor</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 border border-emerald-500 px-2 py-0.5 text-[9px]">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {slot.merchant.storeLogo ? (
                    <img
                      src={slot.merchant.storeLogo}
                      alt={slot.merchant.name}
                      className="w-10 h-10 border-2 border-[#111111] object-cover bg-white shrink-0 shadow-[2px_2px_0px_#111111]"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#FFB703] border-2 border-[#111111] flex items-center justify-center font-black text-xs shrink-0 shadow-[2px_2px_0px_#111111]">
                      {slot.merchant.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-[#111111] font-display uppercase truncate">
                      {slot.merchant.name}
                    </h4>
                    <a
                      href={`https://${slot.merchant.myshopifyDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#005F73] hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{slot.merchant.myshopifyDomain}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Related Products Section */}
        {relatedSlots.length > 0 && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between border-b-4 border-[#111111] pb-3">
              <h3 className="text-lg sm:text-xl font-black text-[#111111] font-display uppercase tracking-tight">
                Related Catalog Slots
              </h3>
              <Link href="/" className="text-xs font-mono font-bold text-[#005F73] hover:underline flex items-center gap-1">
                <span>View All Products</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedSlots.map((relSlot) => (
                <ListingCard
                  key={relSlot.id}
                  slot={relSlot}
                  onSelect={() => router.push(`/product/${relSlot.id}`)}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Sticky Bottom Buy Bar (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-4 border-[#111111] p-3 shadow-[0px_-6px_20px_rgba(0,0,0,0.15)] flex items-center justify-between gap-2.5 font-mono">
        <div className="min-w-0 flex-1">
          <span className="text-[9px] text-[#2B2D42] uppercase block font-bold truncate">
            {currentVariant.title !== "Default Title" ? currentVariant.title : slot.category}
          </span>
          <span className="text-lg font-black text-[#111111]">
            {formatCurrency(currentVariant.price || slot.price, slot.currencyCode || "INR")}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://wa.me/${slot.merchant.whatsappNumber || "919876543210"}?text=${encodeURIComponent(
              `Hi ${slot.merchant.name}! I want to purchase "${slot.title}" (Variant: ${currentVariant.title}, SKU: ${currentVariant.sku || slot.sku}). Price: ${formatCurrency(currentVariant.price || slot.price, slot.currencyCode || "INR")}. Please share purchase & delivery details.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-[#25D366] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-y-0.5"
            title="Contact / Buy on WhatsApp"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>

          <a
            href={slot.productUrl || `https://${slot.merchant.myshopifyDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3.5 bg-[#111111] hover:bg-[#D62828] text-white border-2 border-[#111111] text-xs font-mono font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#FFB703] uppercase tracking-wider"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#FFB703]" />
            <span>Buy Now</span>
          </a>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="border-t-4 border-[#111111] bg-white mt-12 pb-20 lg:pb-6 pt-6 text-center font-mono text-xs font-bold text-[#111111]">
        © {siteSettings.dropshippingYear} {siteSettings.siteTitle} — B2B DIRECT DROPSHIPPING MARKETPLACE
      </footer>
    </div>
  );
}
