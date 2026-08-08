import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getShopifyAuthUrl } from "@/lib/shopify-admin";

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Missing 'shop' query parameter (e.g. ?shop=store.myshopify.com)" }, { status: 400 });
  }

  // Generate random state nonce for OAuth security
  const stateNonce = crypto.randomBytes(16).toString("hex");
  const authUrl = getShopifyAuthUrl(shop, stateNonce);

  // Redirect merchant to Shopify OAuth confirmation screen
  const res = NextResponse.redirect(authUrl);
  res.cookies.set("shopify_oauth_state", stateNonce, { httpOnly: true, secure: true, path: "/" });

  return res;
}
