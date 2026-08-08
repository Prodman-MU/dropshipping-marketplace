import crypto from "crypto";

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Generate Shopify OAuth authorization URL for merchant installation
 */
export function getShopifyAuthUrl(shopDomain: string, state: string): string {
  const cleanDomain = shopDomain.replace(/^https?:\/\//, "").trim();
  const redirectUri = encodeURIComponent(`${APP_URL}/api/shopify/callback`);
  const scopes = encodeURIComponent("read_products,read_inventory,read_orders");

  return `https://${cleanDomain}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
}

/**
 * Exchange temporary authorization code for permanent access token
 */
export async function exchangeShopifyCodeForToken(shopDomain: string, code: string): Promise<string | null> {
  const cleanDomain = shopDomain.replace(/^https?:\/\//, "").trim();
  const url = `https://${cleanDomain}/admin/oauth/access_token`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    if (!res.ok) {
      console.error(`Failed to exchange token for ${cleanDomain}:`, await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token || null;
  } catch (error) {
    console.error("Shopify OAuth Token Exchange Error:", error);
    return null;
  }
}

/**
 * Register Admin Webhook subscriptions (products/update, inventory_levels/update)
 */
export async function registerShopifyWebhook(
  shopDomain: string,
  accessToken: string,
  topic: string
): Promise<boolean> {
  const cleanDomain = shopDomain.replace(/^https?:\/\//, "").trim();
  const webhookUrl = `${APP_URL}/api/webhooks/shopify`;
  const url = `https://${cleanDomain}/admin/api/2024-04/webhooks.json`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address: webhookUrl,
          format: "json",
        },
      }),
    });

    if (res.ok || res.status === 422) {
      // 422 usually means webhook already registered
      return true;
    }

    console.warn(`Webhook registration warning for ${topic}:`, await res.text());
    return false;
  } catch (error) {
    console.error(`Failed to register webhook ${topic}:`, error);
    return false;
  }
}

/**
 * Fetch products from Admin API REST/GraphQL
 */
export async function fetchAdminCatalog(shopDomain: string, accessToken: string): Promise<any[]> {
  const cleanDomain = shopDomain.replace(/^https?:\/\//, "").trim();
  const url = `https://${cleanDomain}/admin/api/2024-04/products.json?limit=50`;

  try {
    const res = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
      },
    });

    if (!res.ok) {
      console.error(`Admin catalog fetch failed for ${cleanDomain}:`, await res.text());
      return [];
    }

    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Fetch Admin Catalog Error:", error);
    return [];
  }
}
