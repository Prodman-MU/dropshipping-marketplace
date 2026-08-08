# Shopify API & Webhook Integration Deep-Dive

This document provides complete technical specifications for the Shopify Storefront GraphQL API, Admin OAuth 2.0 connection workflow, and Webhook processing pipeline.

---

## 🔑 1. Storefront GraphQL API Client ([`lib/shopify.ts`](file:///d:/lab/projects/dropshipping-marketplace/lib/shopify.ts))

The marketplace interfaces with Shopify Storefront API version `2024-04` using GraphQL.

### Storefront Fetch Execution Engine

```typescript
export async function shopifyStorefrontFetch({
  query,
  variables = {},
  domain = SHOPIFY_STORE_DOMAIN,
  token = SHOPIFY_STOREFRONT_TOKEN,
}: {
  query: string;
  variables?: Record<string, any>;
  domain?: string;
  token?: string;
}) {
  if (!domain || !token) {
    throw new Error("Missing Shopify Storefront domain or access token.");
  }

  const endpoint = `https://${domain.replace(/^https?:\/\//, "")}/api/2024-04/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.statusText}`);
  }

  return response.json();
}
```

### Direct Checkout Mutation (`cartCreate`)

When a user selects a variant and clicks **"Buy on Shopify Storefront"**, `createShopifyCartCheckout` calls the `cartCreate` mutation:

```typescript
export async function createShopifyCartCheckout(variantId: string, quantity: number = 1): Promise<string | null> {
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
  });

  return res.data?.cartCreate?.cart?.checkoutUrl || null;
}
```

---

## 🔐 2. Admin OAuth 2.0 Protocol

### Scopes Required
- `read_products`: Access catalog product titles, categories, tags, images, and variants.
- `read_inventory`: Access real-time inventory level quantities.
- `read_orders`: Access order fulfillment states.

### Step 1: OAuth Redirection (`/api/shopify/auth`)

```typescript
// app/api/shopify/auth/route.ts
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });

  const stateNonce = crypto.randomBytes(16).toString("hex");
  const authUrl = getShopifyAuthUrl(shop, stateNonce);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("shopify_oauth_state", stateNonce, { httpOnly: true, secure: true, path: "/" });

  return res;
}
```

### Step 2: OAuth Code Exchange (`/api/shopify/callback`)

```typescript
// app/api/shopify/callback/route.ts
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("shopify_oauth_state")?.value;

  if (savedState && state !== savedState) {
    return NextResponse.json({ error: "CSRF state mismatch" }, { status: 403 });
  }

  const accessToken = await exchangeShopifyCodeForToken(shop, code);

  // Register Webhooks
  await Promise.all([
    registerShopifyWebhook(shop, accessToken, "products/create"),
    registerShopifyWebhook(shop, accessToken, "products/update"),
    registerShopifyWebhook(shop, accessToken, "inventory_levels/update"),
  ]);

  return NextResponse.redirect(new URL("/?connected=true", req.url));
}
```

---

## ⚡ 3. Webhook Ingestion Engine ([`app/api/webhooks/shopify/route.ts`](file:///d:/lab/projects/dropshipping-marketplace/app/api/webhooks/shopify/route.ts))

### Webhook Headers
- `x-shopify-topic`: Webhook event identifier (e.g. `products/update`).
- `x-shopify-hmac-sha256`: SHA256 base64 signature string.
- `x-shopify-shop-domain`: Source myshopify store domain.

### Supported Webhook Events & Handlers

| Topic | Trigger | Action Performed |
|---|---|---|
| `products/create` | New product added in Shopify Admin | Creates new `Listing` slot with generated `SLOT #XXX` badge |
| `products/update` | Product price, tags, or description updated | Updates `Listing` title, price, compareAtPrice, variants |
| `products/delete` | Product removed from Shopify store | Updates `Listing` status to `SOLD` or marks for removal |
| `inventory_levels/update` | Stock quantity changed in warehouse | Updates `inventoryQuantity` and recalculates status (`AVAILABLE` / `RESERVED` / `SOLD`) |

### HMAC Verification Function

```typescript
export function verifyShopifyHmac(bodyText: string, hmacHeader: string | null): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET || !hmacHeader) return true;

  const hash = crypto
    .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
    .update(bodyText, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
}
```

---

## 🚦 4. Rate Limiting & Resilience

- **Shopify Leaky Bucket Rate Limit**: Storefront API limits requests to 50 points/second. The application implements standard revalidation headers (`next: { revalidate: 60 }`) to cache Storefront responses for 60 seconds.
- **Webhook Idempotency**: Webhook processors check `shopifyProductId` and `shopifyVariantId` unique constraints before performing DB upserts to prevent duplicate slot generation.
