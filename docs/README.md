# Comprehensive Technical Documentation Suite

Welcome to the official developer documentation suite for the **DeLorean x Masters' Union Shopify Marketplace Platform**.

---

## 📚 Table of Contents

1. 🚀 [**Getting Started Guide**](./GETTING_STARTED.md)
   - Local prerequisites (Node.js, PostgreSQL)
   - Step-by-step installation & environment variable breakdown (`.env.local`)
   - Database schema setup with Prisma ORM
   - Development workflow & ngrok local webhook testing

2. 🏛️ [**System Architecture & Technical Specifications**](./ARCHITECTURE.md)
   - High-level event-driven architecture & sequence diagrams
   - Database schema models (`Merchant`, `Listing`, `SyncLog`) with indexes
   - Component hierarchy & state management
   - Invariant error handling & graceful fallback strategy

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
   - DeLorean x Masters' Union obsidian color tokens & glassmorphic CSS utilities
   - Monospaced typography rules (`font-mono`)
   - Scroll-reactive ambient background video formulas
   - Component interface & prop contracts reference
