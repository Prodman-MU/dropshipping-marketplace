# Tier 2: Shopify Storefront GraphQL API & Direct Checkout Specification

> **Document Status**: Proposed Architectural Specification & Implementation Roadmap  
> **Target System**: Masters' Union Shopify Multi-Vendor Marketplace  
> **Target Version**: Tier 2 Storefront API Enhancement  

---

## 📌 1. Overview & Objectives

Tier 2 expands the marketplace engine beyond unauthenticated public catalog fetching by incorporating **Shopify Storefront GraphQL API Access Tokens**. 

When a merchant provides a Storefront API Access Token, the system gains access to high-throughput tokenized GraphQL endpoints, exact inventory counts (`quantityAvailable`), and direct 1-click buyer cart mutations (`cartCreate`).

### Key Goals
1. **Token Persistence**: Store and associate `storefrontToken` on `MerchantVendor` records.
2. **1-Click Cart Checkout**: Use the `cartCreate` GraphQL mutation via `POST /api/shopify/checkout` to generate direct, pre-populated Shopify checkout URLs (`checkoutUrl`).
3. **Deep Inventory & Pricing Insight**: Query `quantityAvailable`, `compareAtPriceRange`, localized pricing, and product variants with tokenized rate limits (60 points/sec).
4. **Visual UI Badging**: Display Tier 2 "Storefront GraphQL API Active" indicators across filter bars, merchant cards, and product drawers.

---

## 📐 2. Data Model Extensions (`data/mock-slots.ts`)

### `MerchantVendor` Interface Update
```typescript
export interface MerchantVendor {
  id: string;
  name: string;
  myshopifyDomain: string;
  storeLogo: string;
  status: "ACTIVE" | "PENDING" | "REJECTED";
  totalProducts: number;
  connectedSince: string;
  lastWebhookSync: string;
  storefrontToken?: string; // Tier 2 Storefront API Access Token
}
```

### `SlotListing` Interface Update
```typescript
export interface SlotListing {
  id: string;
  slotNumber: string;
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
```

---

## ⚡ 3. GraphQL Mutations & Queries (`lib/shopify.ts`)

### 3.1 Storefront GraphQL Catalog Query
```graphql
query getProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        handle
        title
        description
        productType
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        compareAtPriceRange {
          minVariantPrice {
            amount
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              sku
              quantityAvailable
              currentlyNotInStock
              priceV2 {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
```

### 3.2 Storefront Cart Creation Mutation (`cartCreate`)
```graphql
mutation createCart($lineItems: [CartLineInput!]) {
  cartCreate(input: { lines: $lineItems }) {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## 🛠️ 4. Server-Side API Endpoint (`/api/shopify/checkout`)

### `POST /api/shopify/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { shopifyStorefrontFetch } from "@/lib/shopify";

export async function POST(req: NextRequest) {
  try {
    const { domain, token, variantId, quantity = 1 } = await req.json();

    if (!domain || !variantId) {
      return NextResponse.json(
        { error: "Domain and shopifyVariantId are required." },
        { status: 400 }
      );
    }

    const mutation = `
      mutation createCart($lineItems: [CartLineInput!]) {
        cartCreate(input: { lines: $lineItems }) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const res = await shopifyStorefrontFetch({
      query: mutation,
      variables: {
        lineItems: [{ merchandiseId: variantId, quantity }],
      },
      domain,
      token,
    });

    const checkoutUrl = res.data?.cartCreate?.cart?.checkoutUrl;

    if (checkoutUrl) {
      return NextResponse.json({ success: true, checkoutUrl });
    }

    const userError = res.data?.cartCreate?.userErrors?.[0]?.message;
    return NextResponse.json(
      { error: userError || "Failed to generate cart checkout URL." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Cart checkout mutation error." },
      { status: 500 }
    );
  }
}
```

---

## 🎨 5. UI/UX Specifications

### 5.1 Store Connection Modal (`ConnectStoreModal.tsx`)
- Storefront API Access Token field input (`shpat_...` or Storefront Token).
- Passes `token` to `onConnect(domain, token)`.

### 5.2 Product Detail Drawer (`ListingDrawer.tsx`)
- **Direct API Checkout Button**: When `slot.merchant.storefrontToken` is present, renders a **⚡ 1-Click Direct API Checkout** button that calls `/api/shopify/checkout` and redirects directly to Shopify's secure checkout page.
- **Storefront API Status Badge**: Displays a cyber gold **GraphQL Storefront API Active** status pill in the `Shopify & Inventory` tab.

---

## 📋 6. Future Implementation Checklist

When ready to execute Tier 2 improvements:
- [ ] Add `storefrontToken` field to `MerchantVendor` interface in `data/mock-slots.ts`.
- [ ] Update `fetchProductsFromShopifyStore` in `lib/shopify.ts` to attach `storefrontToken` to merchant output.
- [ ] Create `app/api/shopify/checkout/route.ts` API endpoint.
- [ ] Add 1-click cart checkout handler to `ListingDrawer.tsx`.
- [ ] Add Tier 2 Storefront API badge indicators across merchant cards and filter panels.
- [ ] Verify build with `npx tsc --noEmit`.
