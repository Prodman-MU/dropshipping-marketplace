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
  status: "ACTIVE" | "PENDING";
  totalProducts: number;
  connectedSince: string;
  lastWebhookSync: string;
}

export interface SlotListing {
  id: string;
  slotNumber: string; // e.g. "SLOT #001"
  title: string;
  description: string;
  category: "Tactical Tech & EDC" | "Desk Setup & Keyboards" | "Audiophile Hardware" | "Wearable Wear";
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
  createdAt: string;
  syncLogs: WebhookSyncLog[];
}

export const MOCK_MERCHANTS: MerchantVendor[] = [
  {
    id: "m-001",
    name: "Apex Gear Co.",
    myshopifyDomain: "apex-gear.myshopify.com",
    storeLogo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    totalProducts: 48,
    connectedSince: "2024-01-15",
    lastWebhookSync: "2 mins ago",
  },
  {
    id: "m-002",
    name: "Luxe Craft Studio",
    myshopifyDomain: "luxe-craft.myshopify.com",
    storeLogo: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    totalProducts: 32,
    connectedSince: "2024-03-01",
    lastWebhookSync: " Just now",
  },
  {
    id: "m-003",
    name: "Velox Audio Labs",
    myshopifyDomain: "velox-audio.myshopify.com",
    storeLogo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    totalProducts: 19,
    connectedSince: "2024-04-10",
    lastWebhookSync: "12 mins ago",
  },
];

export const MOCK_SLOTS: SlotListing[] = [
  {
    id: "slot-001",
    slotNumber: "SLOT #001",
    title: "Apex Horizon Carbon Fiber MagSafe Power Station",
    description: "Military-grade carbon fiber 10,000mAh magnetic wireless power bank with active heat dissipation and dual 45W USB-C PD throughput. Direct Shopify Storefront fulfillment asset.",
    category: "Tactical Tech & EDC",
    price: 149.00,
    compareAtPrice: 189.00,
    inventoryQuantity: 240,
    status: "AVAILABLE",
    shopifyProductId: "gid://shopify/Product/9842019481",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284910",
    merchant: MOCK_MERCHANTS[0],
    tags: ["MagSafe", "Carbon Fiber", "USB-C PD", "EDC"],
    images: [
      "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "APX-MAG-CB-10K",
    createdAt: "2024-07-01",
    variants: [
      { id: "v-1", title: "Stealth Black Carbon", price: 149.00, sku: "APX-MAG-BLK", inventoryQuantity: 180, availableForSale: true },
      { id: "v-2", title: "Titanium Silver Mesh", price: 159.00, sku: "APX-MAG-SLV", inventoryQuantity: 60, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-1", eventType: "inventory_levels/update", status: "SUCCESS", timestamp: "2026-08-08 15:58:12", details: "Inventory updated: +50 units synced from Shopify Admin Webhook" },
      { id: "log-2", eventType: "products/update", status: "SUCCESS", timestamp: "2026-08-07 10:20:00", details: "Price & variant details updated via Storefront API" },
    ],
  },
  {
    id: "slot-002",
    slotNumber: "SLOT #002",
    title: "Vanguard Titan Modular Tactical Backpack 35L",
    description: "Waterproof 1000D Cordura ballistic nylon modular pack with MOLLE laser-cut system and padded 17-inch laptop compartment. Multi-vendor dropshipping asset.",
    category: "Tactical Tech & EDC",
    price: 210.00,
    compareAtPrice: 260.00,
    inventoryQuantity: 85,
    status: "AVAILABLE",
    shopifyProductId: "gid://shopify/Product/9842019482",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284911",
    merchant: MOCK_MERCHANTS[0],
    tags: ["Cordura", "Modular", "MOLLE", "Travel"],
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "APX-VNG-35L-CO",
    createdAt: "2024-07-03",
    variants: [
      { id: "v-3", title: "Coyote Tan", price: 210.00, sku: "APX-VNG-TAN", inventoryQuantity: 50, availableForSale: true },
      { id: "v-4", title: "Obsidian Black", price: 210.00, sku: "APX-VNG-BLK", inventoryQuantity: 35, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-3", eventType: "products/update", status: "SUCCESS", timestamp: "2026-08-08 14:15:30", details: "Variant stock update via Shopify Webhook" },
    ],
  },
  {
    id: "slot-003",
    slotNumber: "SLOT #003",
    title: "Chrono-Precision Titanium Multitool Pen",
    description: "Grade 5 Titanium CNC machined stylus, glass-breaker, and pressurized ink cartridge multitool pen with sapphire crystal accent.",
    category: "Tactical Tech & EDC",
    price: 89.00,
    compareAtPrice: 110.00,
    inventoryQuantity: 12,
    status: "RESERVED",
    shopifyProductId: "gid://shopify/Product/9842019483",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284912",
    merchant: MOCK_MERCHANTS[0],
    tags: ["Titanium", "EDC Pen", "CNC Machined"],
    images: [
      "https://images.unsplash.com/photo-1585336261026-8f5786372966?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "APX-PEN-TI-GR5",
    createdAt: "2024-07-05",
    variants: [
      { id: "v-5", title: "Raw Stonewashed Titanium", price: 89.00, sku: "APX-PEN-RAW", inventoryQuantity: 12, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-4", eventType: "inventory_levels/update", status: "SUCCESS", timestamp: "2026-08-08 11:00:00", details: "Reserved stock hold initiated" },
    ],
  },
  {
    id: "slot-004",
    slotNumber: "SLOT #004",
    title: "Luxe Keyboards Artisan Gasket 75% Mechanical Keyboard",
    description: "CNC Anodized Aluminum chassis, hot-swappable PCB, FR4 plate, and custom lubed linear switches with PBT double-shot keycaps.",
    category: "Desk Setup & Keyboards",
    price: 295.00,
    compareAtPrice: 340.00,
    inventoryQuantity: 140,
    status: "AVAILABLE",
    shopifyProductId: "gid://shopify/Product/9842019484",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284913",
    merchant: MOCK_MERCHANTS[1],
    tags: ["Mechanical Keyboard", "Custom Aluminum", "Gasket Mount"],
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "LXK-ART-75-ALU",
    createdAt: "2024-07-10",
    variants: [
      { id: "v-6", title: "Space Grey / Dark Keycaps", price: 295.00, sku: "LXK-75-GRY", inventoryQuantity: 90, availableForSale: true },
      { id: "v-7", title: "E-White / Minimal Gold", price: 315.00, sku: "LXK-75-WHT", inventoryQuantity: 50, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-5", eventType: "products/create", status: "SUCCESS", timestamp: "2026-08-08 09:30:11", details: "Storefront catalog slot created" },
    ],
  },
  {
    id: "slot-005",
    slotNumber: "SLOT #005",
    title: "Aura Wooden Ergonomic Monitor Riser & Desk Mat Combo",
    description: "Solid Walnut wood dual-monitor riser platform paired with waterproof felt microfiber extra-wide desk mat.",
    category: "Desk Setup & Keyboards",
    price: 165.00,
    compareAtPrice: 195.00,
    inventoryQuantity: 65,
    status: "AVAILABLE",
    shopifyProductId: "gid://shopify/Product/9842019485",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284914",
    merchant: MOCK_MERCHANTS[1],
    tags: ["Walnut Wood", "Ergonomic Riser", "Desk Accessories"],
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "LXK-AUR-RSR-WLN",
    createdAt: "2024-07-12",
    variants: [
      { id: "v-8", title: "American Walnut", price: 165.00, sku: "LXK-AUR-WLN", inventoryQuantity: 45, availableForSale: true },
      { id: "v-9", title: "Natural Oak", price: 165.00, sku: "LXK-AUR-OAK", inventoryQuantity: 20, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-6", eventType: "inventory_levels/update", status: "SUCCESS", timestamp: "2026-08-07 18:00:00", details: "Inventory sync complete" },
    ],
  },
  {
    id: "slot-006",
    slotNumber: "SLOT #006",
    title: "Luxe Coiled Aviator Keyboard Cable (Custom Braid)",
    description: "Handmade double-sleeved techflex coiled USB-C cable featuring a chrome GX16 aviator quick-release connector.",
    category: "Desk Setup & Keyboards",
    price: 49.00,
    compareAtPrice: 65.00,
    inventoryQuantity: 0,
    status: "SOLD",
    shopifyProductId: "gid://shopify/Product/9842019486",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284915",
    merchant: MOCK_MERCHANTS[1],
    tags: ["Aviator Cable", "Coiled USB-C", "Custom Cable"],
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "LXK-CBL-AVT-BLK",
    createdAt: "2024-07-14",
    variants: [
      { id: "v-10", title: "Matte Black / Chrome", price: 49.00, sku: "LXK-CBL-BLK", inventoryQuantity: 0, availableForSale: false },
    ],
    syncLogs: [
      { id: "log-7", eventType: "inventory_levels/update", status: "SUCCESS", timestamp: "2026-08-08 12:40:00", details: "Stock depleted -> Status auto-marked as SOLD" },
    ],
  },
  {
    id: "slot-007",
    slotNumber: "SLOT #007",
    title: "Velox Studio Master Planar Magnetic Headphones",
    description: "Open-back 90mm ultra-thin planar magnetic drivers, genuine leather ear cushions, and 3.5mm balanced silver cable.",
    category: "Audiophile Hardware",
    price: 549.00,
    compareAtPrice: 650.00,
    inventoryQuantity: 42,
    status: "AVAILABLE",
    shopifyProductId: "gid://shopify/Product/9842019487",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284916",
    merchant: MOCK_MERCHANTS[2],
    tags: ["Planar Magnetic", "Open-Back", "Hi-Fi Audio"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "VLX-PLN-MSTR-90",
    createdAt: "2024-07-20",
    variants: [
      { id: "v-11", title: "Gunmetal Edition", price: 549.00, sku: "VLX-PLN-GMT", inventoryQuantity: 30, availableForSale: true },
      { id: "v-12", title: "Bronze Anodized", price: 579.00, sku: "VLX-PLN-BRZ", inventoryQuantity: 12, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-8", eventType: "products/update", status: "SUCCESS", timestamp: "2026-08-08 14:50:00", details: "Shopify Storefront product specs synced" },
    ],
  },
  {
    id: "slot-008",
    slotNumber: "SLOT #008",
    title: "Velox Pulse Hi-Res Desktop DAC & Balanced Amplifier",
    description: "Dual ESS SABRE ES9038PRO DAC chips, DSD512 native support, 4.4mm balanced headphone out, and OLED status display.",
    category: "Audiophile Hardware",
    price: 389.00,
    compareAtPrice: 440.00,
    inventoryQuantity: 28,
    status: "AVAILABLE",
    shopifyProductId: "gid://shopify/Product/9842019488",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284917",
    merchant: MOCK_MERCHANTS[2],
    tags: ["Hi-Res DAC", "ES9038PRO", "Balanced Amp"],
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "VLX-DAC-PLS-9038",
    createdAt: "2024-07-22",
    variants: [
      { id: "v-13", title: "Obsidian Black Chassis", price: 389.00, sku: "VLX-DAC-BLK", inventoryQuantity: 28, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-9", eventType: "products/update", status: "SUCCESS", timestamp: "2026-08-08 10:10:00", details: "Webhook sync verified" },
    ],
  },
  {
    id: "slot-009",
    slotNumber: "SLOT #009",
    title: "Velox Acoustic Isolation Desk Stands (Pair)",
    description: "Heavyweight CNC milled aluminum speaker stands with high-density acoustic isolation foam dampeners for studio monitors.",
    category: "Audiophile Hardware",
    price: 119.00,
    compareAtPrice: 140.00,
    inventoryQuantity: 5,
    status: "RESERVED",
    shopifyProductId: "gid://shopify/Product/9842019489",
    shopifyVariantId: "gid://shopify/ProductVariant/4910284918",
    merchant: MOCK_MERCHANTS[2],
    tags: ["Speaker Stands", "Acoustic Foam", "Studio Gear"],
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    ],
    sku: "VLX-STND-ACS-PR",
    createdAt: "2024-07-25",
    variants: [
      { id: "v-14", title: "Black Anodized Pair", price: 119.00, sku: "VLX-STND-BLK", inventoryQuantity: 5, availableForSale: true },
    ],
    syncLogs: [
      { id: "log-10", eventType: "inventory_levels/update", status: "SUCCESS", timestamp: "2026-08-08 13:00:00", details: "Low inventory alert logged" },
    ],
  },
];
