/**
 * @file route.ts (under app/api/shopify/auth/)
 * @description Shopify OAuth 2.0 Initiation Route Handler.
 * 
 * Initiates the merchant store onboarding flow. Generates a secure CSRF state nonce,
 * stores it in an HttpOnly cookie, and redirects the vendor to Shopify's OAuth
 * permission consent screen to grant `read_products` and `read_inventory` scopes.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getShopifyAuthUrl } from "@/lib/shopify-admin";

/**
 * Handles GET /api/shopify/auth?shop=example.myshopify.com
 */
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");

  // Validate presence of target myshopify store domain
  if (!shop) {
    return NextResponse.json(
      { error: "Missing 'shop' query parameter (e.g. ?shop=store.myshopify.com)" },
      { status: 400 }
    );
  }

  // Generate a random 16-byte state nonce for OAuth CSRF protection
  const stateNonce = crypto.randomBytes(16).toString("hex");
  const authUrl = getShopifyAuthUrl(shop, stateNonce);

  // Redirect merchant to Shopify OAuth consent screen and store nonce in HttpOnly cookie
  const res = NextResponse.redirect(authUrl);
  res.cookies.set("shopify_oauth_state", stateNonce, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "lax",
  });

  return res;
}
