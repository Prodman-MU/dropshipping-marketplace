# Getting Started Guide

Welcome to the **Masters' Union Shopify Marketplace Platform**. This guide covers local environment setup, configuration with Supabase and Prisma 7, running the development server, executing database migrations, and setting up Shopify webhooks.

---

## 🛠️ Prerequisites

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Docker Desktop**: Required for local Supabase / PostgreSQL containers
- **Shopify Partner Account** (Optional for live Shopify OAuth and Webhook testing)

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies

```bash
cd dropshipping-marketplace
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# ==============================================================================
# Database Configuration (Local Supabase Docker Stack)
# ==============================================================================
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# ==============================================================================
# Supabase Auth & Storage (Local Stack)
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key"
SUPABASE_SERVICE_ROLE_KEY="dummy_service_role_key"

# ==============================================================================
# Application Settings & Passcodes
# ==============================================================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_PASSCODE="admin123"
MASTER_VENDOR_PASSCODE="vendor123"

# ==============================================================================
# Shopify Storefront API Credentials (Optional - Mock fallback enabled if omitted)
# ==============================================================================
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="apex-gear.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN="your_storefront_access_token"
SHOPIFY_CLIENT_ID="your_shopify_app_api_key"
SHOPIFY_CLIENT_SECRET="your_shopify_app_api_secret"
SHOPIFY_WEBHOOK_SECRET="your_shopify_app_webhook_secret"
```

### 3. Start Local Supabase Stack

Start the complete offline Supabase infrastructure (Postgres, GoTrue Auth, Storage, Studio UI):

```bash
npx supabase start
```

This starts the following local services:
- **API Gateway**: `http://127.0.0.1:54321`
- **PostgreSQL Database**: `127.0.0.1:54322`
- **Supabase Studio Dashboard**: `http://127.0.0.1:54323`
- **Inbucket Local Email/OTP Inbox**: `http://127.0.0.1:54324`

### 4. Run Prisma Schema Migrations & Seeding

```bash
# Push migrations to local database
npx prisma migrate dev

# Seed initial catalog items and website settings
npm run db:seed
```

### 5. Run Next.js Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Alternative: Standalone Docker Compose Setup

If you prefer using standard Docker Compose without the Supabase CLI:

```bash
docker-compose up --build
```

---

## ☁️ Connecting to Supabase Cloud

To connect to a hosted Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database** to obtain your connection strings.
3. Update `.env` with your Cloud credentials:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

# Supavisor Pooler (Port 6543)
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Session Connection (Port 5432)
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

4. Deploy migrations to Supabase Cloud:
```bash
npx prisma migrate deploy
```

---

## 🧪 Verification & Build Commands

```bash
# Verify TypeScript types
npx tsc --noEmit

# Compile Prisma Client
npx prisma generate

# Run production build
npm run build

# Start production server
npm run start
```

---

## 🔗 Local Shopify Webhook Testing (ngrok)

To test incoming Shopify webhooks locally:

1. Start an ngrok tunnel:
   ```bash
   ngrok http 3000
   ```
2. Update `NEXT_PUBLIC_APP_URL` in `.env` to your ngrok URL (`https://xxxx.ngrok-free.app`).
3. Set your webhook endpoint in your Shopify Partner Dashboard to `https://xxxx.ngrok-free.app/api/webhooks/shopify`.
