/**
 * @file route.ts (under app/api/shopify/callback/)
 * @description Shopify OAuth 2.0 Token Exchange & Webhook Subscription Callback.
 * 
 * Invoked by Shopify after a merchant approves app installation. Validates CSRF state,
 * exchanges the authorization code for a permanent offline access token, automatically
 * registers Shopify webhooks for real-time catalog syncing, and redirects back to the UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeShopifyCodeForToken, registerShopifyWebhook } from "@/lib/shopify-admin";

/**
 * Handles GET /api/shopify/callback?shop=...&code=...&state=...
 */
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("shopify_oauth_state")?.value;

  if (!shop || !code) {
    return NextResponse.json({ error: "Invalid OAuth callback parameters" }, { status: 400 });
  }

  // Verify state nonce against stored cookie to prevent CSRF attacks
  if (savedState && state !== savedState) {
    return NextResponse.json({ error: "State parameter mismatch (CSRF protection)" }, { status: 403 });
  }

  const cleanDomain = shop.replace(/^https?:\/\//, "").trim();

  // Exchange temporary authorization code for an offline merchant access token
  const accessToken = await exchangeShopifyCodeForToken(cleanDomain, code);

  if (!accessToken) {
    return NextResponse.json(
      { error: "Failed to exchange OAuth code for access token" },
      { status: 500 }
    );
  }

  console.log(`[Shopify OAuth] Merchant connected: ${cleanDomain} | Access Token: Present`);

  // Automatically subscribe to real-time Shopify catalog and inventory webhooks
  await Promise.all([
    registerShopifyWebhook(cleanDomain, accessToken, "products/create"),
    registerShopifyWebhook(cleanDomain, accessToken, "products/update"),
    registerShopifyWebhook(cleanDomain, accessToken, "inventory_levels/update"),
  ]);

  // Redirect back to homepage with success query parameters
  const redirectUrl = new URL("/", req.url);
  redirectUrl.searchParams.set("connected", "true");
  redirectUrl.searchParams.set("domain", cleanDomain);

  return NextResponse.redirect(redirectUrl);
}
