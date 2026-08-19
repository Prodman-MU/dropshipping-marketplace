# Comprehensive Technical Documentation Suite

Welcome to the official developer documentation suite for the **Masters' Union Shopify Multi-Vendor Dropshipping Marketplace Platform**.

---

## 📚 Table of Contents

1. 📖 [**Database & Auth Deep Dive**](./DATABASE_AND_AUTH_DEEP_DIVE.md)
   - First-principles breakdown of PostgreSQL, Prisma 7 ORM vs Alembic, Supabase BaaS, connection pooling with Supavisor, encrypted SSR cookie authentication (`@supabase/ssr`), and object storage architecture.

2. 🏛️ [**System Architecture & Technical Specifications**](./ARCHITECTURE.md)
   - High-level event-driven architecture, sequence diagrams, Prisma 7 schema models (`Merchant`, `Listing`, `Inventory`, `SyncLog`, `SiteSetting`), Supabase client helpers, and component directory tree.

3. 🚀 [**Getting Started Guide**](./GETTING_STARTED.md)
   - Local prerequisites, Supabase CLI local Docker stack (`supabase start`), environment variable configuration, Prisma migrations (`prisma migrate dev`), and ngrok Shopify webhook testing.

4. ✨ [**Project Features Catalog**](./PROJECT_FEATURES.md)
   - Exhaustive breakdown of Bauhaus design aesthetics, ambient background video, dedicated `/product/[id]` pages with WhatsApp B2B inquiry CTAs, 2-column mobile optimization, Supabase Auth session guards, and Admin portal tools.

5. 🔑 [**Shopify API & Webhook Integration Deep-Dive**](./SHOPIFY_INTEGRATION.md)
   - Storefront GraphQL queries, direct buyer checkout mutation (`cartCreate`), Admin OAuth 2.0 flow, webhook pipeline (`products/*`, `inventory_levels/*`), and HMAC SHA256 verification.

6. 📡 [**API Endpoint Reference Manual**](./API_REFERENCE.md)
   - HTTP methods, routes, headers, parameters, Supabase storage utilities (`lib/supabase/storage.ts`), and sample JSON payloads for Shopify & Supabase endpoints.

7. 🎨 [**Design System Specification**](./DESIGN_SYSTEM.md)
   - Bauhaus visual design tokens, `#FFB703` Cyber Gold accents, solid border weights, offset block shadow utilities, and component interface contracts.
