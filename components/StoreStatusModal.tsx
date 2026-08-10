"use client";

import React, { useState } from "react";
import { X, Search, Store, Clock, CheckCircle2, AlertCircle, PlusCircle, ArrowRight } from "lucide-react";
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

  // Filter merchant stores by search input or domain match (cleans trailing slashes, http/https, paths)
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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white border-4 border-[#111111] max-w-xl w-full p-6 sm:p-8 shadow-[10px_10px_0px_#111111] z-10 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#FFB703] border-2 border-[#111111] hover:bg-[#D62828] hover:text-white transition-colors"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Modal Title Header */}
        <div className="mb-6 pb-4 border-b-2 border-[#111111]">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFB703] border border-[#111111] font-mono text-[11px] font-black uppercase mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>VENDOR APPROVAL CENTER</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111]">
            Check Store Approval Status
          </h2>
          <p className="text-xs font-semibold text-[#2B2D42] mt-1">
            Enter your Shopify store name or domain to view live approval & moderation status.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-2 border-[#111111] mb-6 bg-[#F4F4F0]">
          <button
            onClick={() => setActiveTab("lookup")}
            className={`flex-1 py-2.5 px-4 font-display text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "lookup"
                ? "bg-[#111111] text-white"
                : "text-[#111111] hover:bg-[#FFB703]"
            }`}
          >
            01 // Check Store Approval Status
          </button>
          <button
            onClick={() => setActiveTab("connect")}
            className={`flex-1 py-2.5 px-4 font-display text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === "connect"
                ? "bg-[#111111] text-white"
                : "text-[#111111] hover:bg-[#FFB703]"
            }`}
          >
            02 // Connect Store
          </button>
        </div>

        {/* TAB 1: LOOKUP STATUS */}
        {activeTab === "lookup" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-[#111111]" />
              <input
                type="text"
                placeholder="Enter site name or domain (e.g. apex-gear)..."
                value={searchDomain}
                onChange={(e) => setSearchDomain(e.target.value)}
                className="w-full bg-[#F4F4F0] text-[#111111] border-2 border-[#111111] pl-9 pr-4 py-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFB703]"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {!searchDomain.trim() ? (
                <div className="p-8 bg-[#F4F4F0] border-2 border-dashed border-[#111111] text-center space-y-2 font-mono">
                  <Search className="w-8 h-8 text-[#005F73] mx-auto opacity-60" />
                  <h4 className="text-sm font-black uppercase text-[#111111]">Enter Shopify Site Name or Domain Above</h4>
                  <p className="text-xs text-[#2B2D42] font-semibold">
                    Type your store name (e.g. <code className="bg-white px-1 border border-[#111111]">apex-gear</code>) to view live approval status.
                  </p>
                </div>
              ) : filteredMerchants.length > 0 ? (
                filteredMerchants.map((merchant) => (
                  <div
                    key={merchant.id}
                    className="p-3.5 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-display font-black text-sm uppercase text-[#111111]">
                        {merchant.name}
                      </div>
                      <div className="font-mono text-[11px] text-[#005F73] font-bold">
                        {merchant.myshopifyDomain}
                      </div>
                      {merchant.whatsappNumber && (
                        <div className="font-mono text-[10px] text-[#2B2D42] mt-0.5">
                          WhatsApp: +{merchant.whatsappNumber}
                        </div>
                      )}
                    </div>

                    <div>
                      {merchant.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-800 text-emerald-900 font-mono text-[11px] font-black uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved & Live</span>
                        </span>
                      )}
                      {merchant.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFB703]/30 border border-[#111111] text-[#111111] font-mono text-[11px] font-black uppercase">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>Pending Admin Review</span>
                        </span>
                      )}
                      {merchant.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-800 text-red-900 font-mono text-[11px] font-black uppercase">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Application Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 bg-[#F4F4F0] border-2 border-[#111111] text-center space-y-2 font-mono">
                  <p className="text-xs font-bold text-[#111111]">
                    No store submission found matching "{searchDomain}".
                  </p>
                  <button
                    onClick={() => {
                      setNewDomain(cleanStoreDomain(searchDomain));
                      setActiveTab("connect");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFB703] text-[#111111] border-2 border-[#111111] bauhaus-btn text-xs font-bold uppercase"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit "{searchDomain}" Now</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#111111] flex items-center justify-between text-xs font-mono font-bold text-[#2B2D42]">
              <span>Total Submitted Stores: {merchants.length}</span>
              <button
                onClick={() => setActiveTab("connect")}
                className="text-[#005F73] hover:underline flex items-center gap-1 font-black"
              >
                <span>Add your store for approval</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CONNECT STORE FORM */}
        {activeTab === "connect" && (
          <form onSubmit={handleConnectSubmit} className="space-y-4">
            {submitSuccess && (
              <div className="p-4 bg-emerald-300 border-2 border-[#111111] font-mono text-xs font-black uppercase flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-900" />
                <span>Store submitted successfully! Pending Admin Review.</span>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 bg-red-100 border-2 border-[#D62828] font-mono text-xs font-bold text-[#D62828] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#D62828] shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label className="block font-display text-xs font-black uppercase mb-1 text-[#111111]">
                Shopify Store Domain *
              </label>
              <input
                type="text"
                required
                placeholder="mybrand.myshopify.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full bg-[#F4F4F0] text-[#111111] border-2 border-[#111111] px-3.5 py-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-display text-xs font-black uppercase mb-1 text-[#D62828] flex items-center justify-between">
                <span>Set Store Vendor Passcode *</span>
                <span className="text-[10px] font-mono text-[#005F73]">REQUIRED FOR LOGIN</span>
              </label>
              <input
                type="password"
                required
                placeholder="Create vendor portal passcode (e.g. apex123)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-[#F4F4F0] text-[#111111] border-2 border-[#111111] px-3.5 py-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white"
              />
              <p className="text-[10px] font-mono text-[#2B2D42] mt-1 font-bold">
                🔑 Passcode used by the store owner to log in to the /vendor portal desk.
              </p>
            </div>

            <div>
              <label className="block font-display text-xs font-black uppercase mb-1 text-[#111111]">
                Vendor WhatsApp Number (Optional)
              </label>
              <input
                type="text"
                placeholder="+91 9876543210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-[#F4F4F0] text-[#111111] border-2 border-[#111111] px-3.5 py-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-display text-xs font-black uppercase mb-1 text-[#111111]">
                Shopify Storefront / Admin API Access Token (Optional)
              </label>
              <input
                type="password"
                placeholder="shpat_xxxxxxxx / shpca_xxxxxxxx"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full bg-[#F4F4F0] text-[#111111] border-2 border-[#111111] px-3.5 py-2.5 font-mono text-xs font-bold focus:outline-none focus:bg-white"
              />
            </div>

            <div className="p-3 bg-[#F4F4F0] border-2 border-[#111111] text-[11px] font-mono text-[#2B2D42]">
              <strong>Note:</strong> Once added, your store will be marked as <strong>Pending Admin Review</strong>. Products will only be published after Admin approval at the bottom of the page.
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#E5E5E0] text-[#111111] border-2 border-[#111111] font-display text-xs font-black uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newDomain.trim() || !passcode.trim()}
                className="px-6 py-2.5 bg-[#D62828] text-white border-2 border-[#111111] bauhaus-btn text-xs font-black uppercase disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Store for Approval"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
