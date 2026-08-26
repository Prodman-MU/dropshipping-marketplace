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

---

## 7. Hero Banner & Co-Marketing Ad Submissions (`/api/ads`)

Manages vendor co-marketing banner campaigns displayed in the homepage Hero Carousel.

### `GET /api/ads`
Fetches ad submissions with optional status or merchant filtering.

- **Query Parameters**:
  - `status` (optional, string): `"PENDING" | "APPROVED" | "REJECTED" | "ALL"` (defaults to `"ALL"`).
  - `merchantId` (optional, string): Filter by fulfilling merchant UUID.
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "submissions": [
    {
      "id": "ad-1740562800000",
      "merchantId": "m-001",
      "type": "IMAGE_AD",
      "status": "APPROVED",
      "badge": "SUMMER COLLECTION",
      "title": "Tactical Everyday Carry Drop",
      "subtitle": "Engineered for durability and precision.",
      "mediaSrc": "https://example.supabase.co/storage/v1/object/public/marketplace-assets/ads/hero.jpg",
      "ctaText": "Explore Drop",
      "ctaLink": "#product-catalog",
      "rejectionReason": null,
      "createdAt": "2026-08-26T14:30:00.000Z",
      "merchant": {
        "id": "m-001",
        "name": "Apex Gear",
        "myshopifyDomain": "apex-gear.myshopify.com",
        "storeLogo": "/assets/store-logos/apex.png"
      }
    }
  ]
}
```

### `POST /api/ads`
Submits a new vendor ad request for administrator moderation.

- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "merchantId": "m-001",
  "type": "IMAGE_AD",
  "badge": "EXCLUSIVE DROP",
  "title": "Ultra-light EDC Titanium Pen",
  "subtitle": "Available in limited quantities this cohort.",
  "mediaSrc": "https://cdn.example.com/edc-banner.jpg",
  "ctaText": "Shop Collection",
  "ctaLink": "/product/slot-001"
}
```
- **Supported Formats**:
  - `"IMAGE_AD"`: High-contrast studio product campaign banner.
  - `"VIDEO_AD"`: Autoplaying ambient video slide (`.mp4` / `.webm`).
  - `"SHOWCASE"`: Curated editorial collection layout with title and subtitle.
- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "submission": { "id": "ad-...", "status": "PENDING", ... }
}
```

### `PATCH /api/ads`
Admin moderation action to approve or reject a vendor ad submission.

- **Headers**: `Content-Type: application/json`
- **Body (Approve)**:
```json
{
  "id": "ad-1740562800000",
  "status": "APPROVED",
  "addToCarousel": true
}
```
- **Body (Reject)**:
```json
{
  "id": "ad-1740562800000",
  "status": "REJECTED",
  "rejectionReason": "Creative image resolution does not meet 1920x800 minimum standard."
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "submission": { "id": "ad-1740562800000", "status": "APPROVED" },
  "carouselSlideAdded": true
}
```

### `DELETE /api/ads`
Permanently removes an ad submission from the database.

- **Query Parameters**:
  - `id` (required, string): Submission UUID.
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "deletedId": "ad-1740562800000"
}
```

---

## 8. Authentication & Passcode Operations (`POST /api/auth/passcode`)

Secure endpoint for vendor passcode changes, admin resets, and credential verification.

### Actions Supported:
1. `update_vendor_passcode`: Vendor self-service passcode update (validates current passcode or master admin override).
2. `reset_vendor_passcode`: Admin 1-click reset to default formula (`<domain>123`).
3. `verify_admin_passcode`: Admin login verification.
4. `update_admin_passcode`: Admin updates their master password.

### Example Request (`update_vendor_passcode`):
```json
{
  "action": "update_vendor_passcode",
  "merchantId": "m-001",
  "currentPasscode": "apex123",
  "newPasscode": "ApexSecure2026!",
  "isAdminOverride": false
}
```

### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Passcode updated successfully."
}
```

---

## 9. Bulk & Scheduled Catalog Synchronization (`/api/cron/sync`)

Synchronizes all active supplier stores with their live Shopify catalogs in a single batch.

- **Methods**: `GET`, `POST`
- **Headers**:
  - `Authorization: Bearer <CRON_SECRET>` (optional, required if `CRON_SECRET` is configured)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Scheduled daily sync completed.",
  "timestamp": "2026-08-26T04:00:00.000Z",
  "storesChecked": 6,
  "syncResults": [
    {
      "domain": "apex-gear.myshopify.com",
      "status": "SUCCESS",
      "productsCount": 12
    }
  ]
}
```

---

## 10. Merchants & Listings CRUD Endpoints

### `/api/merchants`
- **`GET /api/merchants`**: Fetches all connected merchants with optional status filter (`?status=ACTIVE`).
- **`POST /api/merchants`**: Direct merchant store registration.
- **`PATCH /api/merchants`**: Update merchant status (`ACTIVE`, `REJECTED`, `PENDING`) or details.
- **`DELETE /api/merchants?id=<id>`**: Disconnects store and cascades removal.

### `/api/listings`
- **`GET /api/listings`**: Returns formatted catalog slots with inventory quantities and fulfilling merchant relations.
  - Query filters: `?status=ACTIVE`, `?merchantId=<id>`, `?domain=<domain>`.
- **`PATCH /api/listings`**: Updates listing retail price, tags, or promotional compareAtPrice.
