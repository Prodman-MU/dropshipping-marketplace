# Getting Started Guide

Welcome to the **Masters' Union Shopify Marketplace Platform**. This guide covers local environment setup, configuration, running the development server, and executing database migrations.

---

## 🛠️ Prerequisites

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14+ (or Supabase / Neon PostgreSQL instance)
- **Shopify Partner Account** (Optional for live Shopify OAuth and Webhooks testing)

---

## 🚀 Quick Setup Instructions

### 1. Clone & Install Dependencies

```bash
cd dropshipping-marketplace
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root based on the following template:

```env
# Database Connection (PostgreSQL / Supabase / Neon)
DATABASE_URL="postgresql://postgres:password@localhost:5432/dropshipping_db?schema=public"

# App Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Shopify Storefront API Credentials (Optional - Mock fallback enabled if omitted)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="apex-gear.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN="your_storefront_access_token_here"

# Shopify Partner App OAuth & Admin Credentials
SHOPIFY_CLIENT_ID="your_shopify_app_api_key"
SHOPIFY_CLIENT_SECRET="your_shopify_app_api_secret"
SHOPIFY_WEBHOOK_SECRET="your_shopify_app_webhook_secret"
```

### 3. Database Schema Setup (Prisma)

Push the database schema to your PostgreSQL instance and generate the Prisma Client:

```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the marketplace UI.

---

## 🧪 Verification & Build Commands

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run production build
npm run build

# Start production server
npm run start
```

---

## 🔗 Local Webhook Testing (ngrok)

To test live incoming Shopify webhooks locally:

1. Start ngrok tunnel: `ngrok http 3000`
2. Update `NEXT_PUBLIC_APP_URL` in `.env.local` to your ngrok URL (`https://xxxx.ngrok-free.app`)
3. Shopify webhooks will hit `https://xxxx.ngrok-free.app/api/webhooks/shopify`.
