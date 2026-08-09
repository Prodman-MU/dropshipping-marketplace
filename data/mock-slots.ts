export interface VariantOption {
  id: string;
  title: string;
  price: number;
  sku: string;
  inventoryQuantity: number;
  availableForSale: boolean;
}

export interface WebhookSyncLog {
  id: string;
  eventType: "products/create" | "products/update" | "inventory_levels/update";
  status: "SUCCESS" | "PENDING" | "FAILED";
  timestamp: string;
  details: string;
}

export interface MerchantVendor {
  id: string;
  name: string;
  myshopifyDomain: string;
  storeLogo: string;
  status: "ACTIVE" | "PENDING" | "REJECTED";
  totalProducts: number;
  connectedSince: string;
  lastWebhookSync: string;
}

export interface SlotListing {
  id: string;
  slotNumber: string; // e.g. "SLOT #001"
  title: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  inventoryQuantity: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  shopifyProductId: string;
  shopifyVariantId: string;
  merchant: MerchantVendor;
  tags: string[];
  images: string[];
  variants: VariantOption[];
  sku: string;
  handle?: string;
  productUrl?: string;
  createdAt: string;
  syncLogs: WebhookSyncLog[];
}

export const MOCK_MERCHANTS: MerchantVendor[] = [];

export const MOCK_SLOTS: SlotListing[] = [];
