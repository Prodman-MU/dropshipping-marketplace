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

export function deleteMerchantStore(merchantId: string, currentMerchants: MerchantVendor[], currentSlots: SlotListing[]) {
  const updatedMerchants = currentMerchants.filter((m) => m.id !== merchantId);
  const updatedSlots = currentSlots.filter((s) => s.merchant.id !== merchantId);
  saveMerchants(updatedMerchants);
  saveSlots(updatedSlots);
  return { updatedMerchants, updatedSlots };
}

export function updateSlotPrice(slotId: string, newPrice: number, currentSlots: SlotListing[]): SlotListing[] {
  const updated = currentSlots.map((slot) => {
    if (slot.id === slotId) {
      const updatedVariants = slot.variants.map((v) => ({ ...v, price: newPrice }));
      const newLog = {
        id: `log-price-${Date.now()}`,
        eventType: "products/update" as const,
        status: "SUCCESS" as const,
        timestamp: new Date().toLocaleTimeString(),
        details: `AI Price Recommendation Applied: Price optimized to ${newPrice}`,
      };
      return {
        ...slot,
        price: newPrice,
        variants: updatedVariants,
        syncLogs: [newLog, ...slot.syncLogs],
      };
    }
    return slot;
  });
  saveSlots(updated);
  return updated;
}

export function restockSlotInventory(slotId: string, addedUnits: number, currentSlots: SlotListing[]): SlotListing[] {
  const updated = currentSlots.map((slot) => {
    if (slot.id === slotId) {
      const newQty = slot.inventoryQuantity + addedUnits;
      const updatedVariants = slot.variants.map((v) => ({
        ...v,
        inventoryQuantity: v.inventoryQuantity + addedUnits,
        availableForSale: true,
      }));
      const newLog = {
        id: `log-stock-${Date.now()}`,
        eventType: "inventory_levels/update" as const,
        status: "SUCCESS" as const,
        timestamp: new Date().toLocaleTimeString(),
        details: `Simulated Restock Action: Added +${addedUnits} units. New Total: ${newQty} units.`,
      };
      return {
        ...slot,
        inventoryQuantity: newQty,
        status: newQty > 0 ? ("AVAILABLE" as const) : slot.status,
        variants: updatedVariants,
        syncLogs: [newLog, ...slot.syncLogs],
      };
    }
    return slot;
  });
  saveSlots(updated);
  return updated;
}

export function updateSlotTags(slotId: string, newTags: string[], currentSlots: SlotListing[]): SlotListing[] {
  const updated = currentSlots.map((slot) => {
    if (slot.id === slotId) {
      const mergedTags = Array.from(new Set([...slot.tags, ...newTags]));
      const newLog = {
        id: `log-tags-${Date.now()}`,
        eventType: "products/update" as const,
        status: "SUCCESS" as const,
        timestamp: new Date().toLocaleTimeString(),
        details: `AI Optimization: Auto-added enhanced discoverability tags: ${newTags.join(", ")}`,
      };
      return {
        ...slot,
        tags: mergedTags,
        syncLogs: [newLog, ...slot.syncLogs],
      };
    }
    return slot;
  });
  saveSlots(updated);
  return updated;
}

