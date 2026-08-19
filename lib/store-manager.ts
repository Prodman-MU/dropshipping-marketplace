/**
 * @file store-manager.ts
 * @description Merchant Store & Product Catalog State Operations Manager.
 * 
 * Provides client-side state mutation utilities for the Admin and Vendor portals.
 * Handles merchant store moderation (Approve, Reject, Delete), price adjustments,
 * inventory restock simulations, and tag optimization with cross-component reactivity
 * via the 'store-state-changed' DOM event.
 */

import { MOCK_MERCHANTS, MOCK_SLOTS, MerchantVendor, SlotListing } from "@/data/mock-slots";

/** LocalStorage key for persisting connected merchant store profiles */
const MERCHANTS_KEY = "dropshipping_marketplace_merchants";
/** LocalStorage key for persisting catalog product slots */
const SLOTS_KEY = "dropshipping_marketplace_slots";

/**
 * Retrieves the list of active merchant profiles with localStorage caching and default fallback.
 * 
 * @returns {MerchantVendor[]} Array of merchant vendor profiles.
 */
export function getInitialMerchants(): MerchantVendor[] {
  if (typeof window === "undefined") return MOCK_MERCHANTS;
  try {
    const saved = localStorage.getItem(MERCHANTS_KEY);
    if (saved) {
      const parsed: MerchantVendor[] = JSON.parse(saved);
      // Filter out legacy temporary test merchant IDs if present
      return parsed.filter((m) => !["m-001", "m-002", "m-003", "m-004"].includes(m.id));
    }
  } catch (e) {
    console.error("Error reading merchants from localStorage", e);
  }
  return MOCK_MERCHANTS;
}

/**
 * Retrieves the list of product catalog slots with localStorage caching and fallback.
 * 
 * @returns {SlotListing[]} Array of catalog listings.
 */
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

/**
 * Persists updated merchants to localStorage and notifies active components.
 * 
 * @param {MerchantVendor[]} merchants - Updated merchant list.
 */
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

/**
 * Persists updated catalog slots to localStorage and notifies active components.
 * 
 * @param {SlotListing[]} slots - Updated catalog listings.
 */
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

/**
 * Approves a candidate merchant store, transitions status to "ACTIVE",
 * and publishes all associated catalog products to the public marketplace.
 * 
 * @param {string} merchantId - UUID of the merchant to approve.
 * @param {MerchantVendor[]} currentMerchants - Current merchant state.
 * @param {SlotListing[]} currentSlots - Current catalog slots state.
 * @returns Object containing the updated merchants and slots arrays.
 */
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

/**
 * Rejects a merchant store, changing status to "REJECTED" and hiding products from the public catalog.
 * 
 * @param {string} merchantId - UUID of the merchant to reject.
 * @param {MerchantVendor[]} currentMerchants - Current merchant list.
 * @param {SlotListing[]} currentSlots - Current catalog slots.
 * @returns Object containing the updated merchants and slots arrays.
 */
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

/**
 * Permanently removes a merchant and cascades deletion to all associated catalog listings.
 * 
 * @param {string} merchantId - UUID of the merchant to delete.
 * @param {MerchantVendor[]} currentMerchants - Current merchant list.
 * @param {SlotListing[]} currentSlots - Current catalog slots.
 * @returns Object containing the filtered merchants and slots arrays.
 */
export function deleteMerchantStore(merchantId: string, currentMerchants: MerchantVendor[], currentSlots: SlotListing[]) {
  const updatedMerchants = currentMerchants.filter((m) => m.id !== merchantId);
  const updatedSlots = currentSlots.filter((s) => s.merchant.id !== merchantId);
  saveMerchants(updatedMerchants);
  saveSlots(updatedSlots);
  return { updatedMerchants, updatedSlots };
}

/**
 * Optimizes the unit price of a specific catalog product slot and records an audit log.
 * 
 * @param {string} slotId - ID of the product slot.
 * @param {number} newPrice - New wholesale / retail price.
 * @param {SlotListing[]} currentSlots - Current slots list.
 * @returns {SlotListing[]} Updated array of catalog slots.
 */
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

/**
 * Simulates a stock replenishment event for a product slot and updates available inventory.
 * 
 * @param {string} slotId - ID of the product slot.
 * @param {number} addedUnits - Number of inventory units added.
 * @param {SlotListing[]} currentSlots - Current slots list.
 * @returns {SlotListing[]} Updated array of catalog slots.
 */
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

/**
 * Appends new search & discoverability tags to a product slot and creates an audit entry.
 * 
 * @param {string} slotId - ID of the product slot.
 * @param {string[]} newTags - Array of tags to add.
 * @param {SlotListing[]} currentSlots - Current slots list.
 * @returns {SlotListing[]} Updated array of catalog slots.
 */
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
