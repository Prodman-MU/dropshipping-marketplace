import { MOCK_MERCHANTS, MOCK_SLOTS, MerchantVendor, SlotListing } from "@/data/mock-slots";

const MERCHANTS_KEY = "dropshipping_marketplace_merchants";
const SLOTS_KEY = "dropshipping_marketplace_slots";

export function getInitialMerchants(): MerchantVendor[] {
  if (typeof window === "undefined") return MOCK_MERCHANTS;
  try {
    const saved = localStorage.getItem(MERCHANTS_KEY);
    if (saved) {
      const parsed: MerchantVendor[] = JSON.parse(saved);
      return parsed.filter((m) => !["m-001", "m-002", "m-003", "m-004"].includes(m.id));
    }
  } catch (e) {
    console.error("Error reading merchants from localStorage", e);
  }
  return MOCK_MERCHANTS;
}

export function getInitialSlots(): SlotListing[] {
  if (typeof window === "undefined") return MOCK_SLOTS;
  try {
    const saved = localStorage.getItem(SLOTS_KEY);
    if (saved) {
      const parsed: SlotListing[] = JSON.parse(saved);
      return parsed.filter((s) => !s.id.startsWith("slot-0"));
    }
  } catch (e) {
    console.error("Error reading slots from localStorage", e);
  }
  return MOCK_SLOTS;
}

export function saveMerchants(merchants: MerchantVendor[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MERCHANTS_KEY, JSON.stringify(merchants));
      window.dispatchEvent(new Event("store-state-changed"));
    } catch (e) {
      console.error("Error saving merchants to localStorage", e);
    }
  }
}

export function saveSlots(slots: SlotListing[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
      window.dispatchEvent(new Event("store-state-changed"));
    } catch (e) {
      console.error("Error saving slots to localStorage", e);
    }
  }
}

export function approveMerchantStore(merchantId: string, currentMerchants: MerchantVendor[], currentSlots: SlotListing[]) {
  const updatedMerchants = currentMerchants.map((m) =>
    m.id === merchantId ? { ...m, status: "ACTIVE" as const } : m
  );
  const updatedSlots = currentSlots.map((s) =>
    s.merchant.id === merchantId
      ? {
          ...s,
          merchant: { ...s.merchant, status: "ACTIVE" as const },
          syncLogs: [
            {
              id: `log-appr-${Date.now()}`,
              eventType: "products/update" as const,
              status: "SUCCESS" as const,
              timestamp: new Date().toLocaleTimeString(),
              details: "Admin Approved Store Integration via /admin panel. Products now live on public marketplace.",
            },
            ...s.syncLogs,
          ],
        }
      : s
  );
  saveMerchants(updatedMerchants);
  saveSlots(updatedSlots);
  return { updatedMerchants, updatedSlots };
}

export function rejectMerchantStore(merchantId: string, currentMerchants: MerchantVendor[], currentSlots: SlotListing[]) {
  const updatedMerchants = currentMerchants.map((m) =>
    m.id === merchantId ? { ...m, status: "REJECTED" as const } : m
  );
  const updatedSlots = currentSlots.map((s) =>
    s.merchant.id === merchantId
      ? { ...s, merchant: { ...s.merchant, status: "REJECTED" as const } }
      : s
  );
  saveMerchants(updatedMerchants);
  saveSlots(updatedSlots);
  return { updatedMerchants, updatedSlots };
}
