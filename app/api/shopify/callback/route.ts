import { NextRequest, NextResponse } from "next/server";
import { exchangeShopifyCodeForToken, registerShopifyWebhook } from "@/lib/shopify-admin";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("shopify_oauth_state")?.value;

  if (!shop || !code) {
    return NextResponse.json({ error: "Invalid OAuth callback parameters" }, { status: 400 });
  }

  // Validate state parameter if cookie present
  if (savedState && state !== savedState) {
    return NextResponse.json({ error: "State parameter mismatch (CSRF protection)" }, { status: 403 });
  }

  const cleanDomain = shop.replace(/^https?:\/\//, "").trim();

  // Exchange code for permanent access token
  const accessToken = await exchangeShopifyCodeForToken(cleanDomain, code);

  if (!accessToken) {
    return NextResponse.json({ error: "Failed to exchange OAuth code for access token" }, { status: 500 });
  }

  console.log(`[Shopify OAuth] Merchant connected: ${cleanDomain} | Access Token: Present`);

  // Register Webhooks automatically
  await Promise.all([
    registerShopifyWebhook(cleanDomain, accessToken, "products/create"),
    registerShopifyWebhook(cleanDomain, accessToken, "products/update"),
    registerShopifyWebhook(cleanDomain, accessToken, "inventory_levels/update"),
  ]);

  // Redirect back to marketplace with connected status flag
  const redirectUrl = new URL("/", req.url);
  redirectUrl.searchParams.set("connected", "true");
  redirectUrl.searchParams.set("domain", cleanDomain);

  return NextResponse.redirect(redirectUrl);
}
