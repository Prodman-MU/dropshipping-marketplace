# API & Endpoint Reference Manual

This document provides complete specifications, HTTP methods, headers, parameters, and sample request/response payloads for the marketplace platform backend APIs and Supabase client utilities.

---

## 1. Supabase Auth Callback (`GET /auth/callback`)

Exchanges an incoming OAuth or email confirmation code for a persistent session stored in secure HTTP cookies.

### Request
- **Method**: `GET`
- **Path**: `/auth/callback`
- **Query Parameters**:
  - `code` (required, string): Temporary authorization code issued by Supabase Auth.
  - `next` (optional, string): Destination redirect path after successful exchange (defaults to `/`).

### Response
- **Status**: `302 Found` (Redirect to `next` URL with HttpOnly session cookies set).

---

## 2. Shopify OAuth Auth Initiation (`GET /api/shopify/auth`)

Initiates the OAuth 2.0 connection workflow for a merchant store.

### Request
- **Method**: `GET`
- **Path**: `/api/shopify/auth`
- **Query Parameters**:
  - `shop` (required, string): The target myshopify store domain (e.g. `store.myshopify.com`).

### Example Request
```http
GET /api/shopify/auth?shop=apex-gear.myshopify.com HTTP/1.1
Host: localhost:3000
```

### Response
- **Status**: `302 Found` (Redirect)
- **Header**: `Location: https://apex-gear.myshopify.com/admin/oauth/authorize?...`
- **Cookie Set**: `shopify_oauth_state={random_nonce}; HttpOnly; Secure; Path=/`

---

## 3. Shopify OAuth Callback (`GET /api/shopify/callback`)

Handles Shopify authorization code exchange and webhook subscription registration.

### Request
- **Method**: `GET`
- **Path**: `/api/shopify/callback`
- **Query Parameters**:
  - `shop` (required, string): Merchant shop domain.
  - `code` (required, string): Temporary authorization code.
  - `state` (required, string): State nonce for CSRF verification.

### Response
- **Status**: `302 Found` (Redirect)
- **Header**: `Location: http://localhost:3000/?connected=true&domain=apex-gear.myshopify.com`

---

## 4. Catalog Sync Endpoint (`POST /api/shopify/sync`)

Triggers a manual or scheduled catalog re-sync for a connected merchant domain.

### Request
- **Method**: `POST`
- **Path**: `/api/shopify/sync`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "myshopifyDomain": "apex-gear.myshopify.com"
}
```

### Success Response
- **Status**: `200 OK`
```json
{
  "success": true,
  "domain": "apex-gear.myshopify.com",
  "syncedSlotsCount": 3,
  "timestamp": "2026-08-19T11:30:00.000Z",
  "slots": [
    {
      "slotNumber": "SLOT #001",
      "title": "Apex Horizon Carbon Fiber MagSafe Power Station",
      "price": 149.00,
      "inventoryQuantity": 240,
      "sku": "APX-MAG-CB-10K",
      "status": "AVAILABLE"
    }
  ]
}
```

---

## 5. Webhook Ingestion Listener (`POST /api/webhooks/shopify`)

Ingests live Shopify Admin webhooks with HMAC SHA256 signature verification.

### Request
- **Method**: `POST`
- **Path**: `/api/webhooks/shopify`
- **Headers**:
  - `Content-Type: application/json`
  - `x-shopify-topic` (required, string): Topic name (e.g. `products/update`, `inventory_levels/update`).
  - `x-shopify-hmac-sha256` (required, string): Signature hash string.
  - `x-shopify-shop-domain` (required, string): Source shop domain.

### Example Payload (`inventory_levels/update`)
```json
{
  "inventory_item_id": 8940281,
  "location_id": 491028,
  "available": 45,
  "updated_at": "2026-08-19T11:28:00.000Z"
}
```

### Success Response
- **Status**: `200 OK`
```json
{
  "received": true,
  "topic": "inventory_levels/update",
  "shopDomain": "apex-gear.myshopify.com",
  "syncAction": "INVENTORY_UPDATED",
  "entityId": null,
  "timestamp": "2026-08-19T11:28:01.000Z",
  "status": "SYNC_LOGGED"
}
```

---

## 6. Supabase Storage SDK Utilities (`lib/supabase/storage.ts`)

### `uploadMarketplaceAsset(file, path, options)`
Uploads a binary file or Blob to the `marketplace-assets` Supabase bucket.

```typescript
import { uploadMarketplaceAsset } from "@/lib/supabase/storage";

const { publicUrl, error } = await uploadMarketplaceAsset(
  logoFile,
  `logos/${merchantId}.png`,
  { contentType: "image/png", upsert: true }
);
```

### `getAssetPublicUrl(path)`
Retrieves the public CDN URL for an existing asset path in `marketplace-assets`.

```typescript
import { getAssetPublicUrl } from "@/lib/supabase/storage";

const url = getAssetPublicUrl(`logos/${merchantId}.png`);
```

### `ensureMarketplaceBucket()`
Server-side initialization utility that verifies the `marketplace-assets` public bucket exists with MIME type restrictions.
