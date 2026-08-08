# Comprehensive Technical Documentation Suite

Welcome to the official developer documentation suite for the **Masters' Union Shopify Marketplace Platform**.

---

## 📚 Table of Contents

1. 🚀 [**Getting Started Guide**](./GETTING_STARTED.md)
   - Local prerequisites (Node.js, PostgreSQL)
   - Step-by-step installation & environment variable breakdown (`.env.local`)
   - Custom asset placement (`public/assets/masters_union_dropshipping_v1.mp4` & `public/assets/logoanimationblack.gif`)
   - Database schema setup with Prisma ORM
   - Development workflow & ngrok local webhook testing

2. 🏛️ [**System Architecture & Technical Specifications**](./ARCHITECTURE.md)
   - High-level event-driven architecture & sequence diagrams
   - Database schema models (`Merchant`, `Listing`, `SyncLog`) with indexes
   - Component hierarchy & directory structure
   - Invariant error handling & fallback strategy

3. 🔑 [**Shopify API & Webhook Integration Deep-Dive**](./SHOPIFY_INTEGRATION.md)
   - Storefront GraphQL queries & direct buyer checkout mutation (`cartCreate`)
   - Admin OAuth 2.0 protocol (`/api/shopify/auth` -> `/api/shopify/callback`)
   - Webhook pipeline for `products/create`, `products/update`, `products/delete`, `inventory_levels/update`
   - HMAC SHA256 signature verification & rate limiting

4. 📡 [**API Endpoint Reference Manual**](./API_REFERENCE.md)
   - HTTP methods, routes, headers, parameters, and sample JSON payloads for:
     - `GET /api/shopify/auth`
     - `GET /api/shopify/callback`
     - `POST /api/shopify/sync`
     - `POST /api/webhooks/shopify`

5. 🎨 [**Design System Specification**](./DESIGN_SYSTEM.md)
   - Cyber Gold & Pure Black color tokens (`#f59e0b` & `#000000`)
   - Monospaced typography rules (`font-mono`)
   - Ambient background video positioning & scroll opacity formulas
   - Component interface & prop contracts reference
