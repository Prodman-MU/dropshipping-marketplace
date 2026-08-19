/**
 * @file shopify-admin.ts
 * @description Shopify Admin REST & OAuth 2.0 Integration Helper.
 * 
 * Handles the OAuth authorization handshake, exchanging temporary grant codes
 * for offline merchant access tokens, registering webhook event subscriptions,
 * and querying the Shopify Admin REST API for product catalogs.
 */

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Generates the full Shopify OAuth installation URL for redirecting merchant store owners.
 * 
 * @param {string} shopDomain - Target myshopify store domain (e.g. "store.myshopify.com").
 * @param {string} state - Cryptographic state nonce for CSRF validation.
 * @returns {string} Fully qualified Shopify authorization URL.
 */
export function getShopifyAuthUrl(shopDomain: string, state: string): string {
  const cleanDomain = shopDomain.replace(/^https?:\/\//, "").trim();
  const redirectUri = encodeURIComponent(`${APP_URL}/api/shopify/callback`);
  const scopes = encodeURIComponent("read_products,read_inventory,read_orders");

  return `https://${cleanDomain}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
}

/**
 * Exchanges a temporary authorization grant code for a permanent offline access token.
 * 
 * @param {string} shopDomain - Merchant myshopify domain.
 * @param {string} code - Temporary authorization code received from OAuth callback.
 * @returns {Promise<string | null>} Permanent access token or null if exchange failed.
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
 * Subscribes to Shopify Admin Webhooks (e.g. products/update, inventory_levels/update)
 * to receive real-time catalog changes.
 * 
 * @param {string} shopDomain - Merchant myshopify domain.
 * @param {string} accessToken - Merchant admin access token.
 * @param {string} topic - Webhook topic identifier.
 * @returns {Promise<boolean>} True if registered or already exists (HTTP 422).
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
      // 422 indicates the webhook subscription already exists
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
 * Fetches product catalog items from the Shopify Admin REST API.
 * 
 * @param {string} shopDomain - Merchant myshopify domain.
 * @param {string} accessToken - Merchant admin access token.
 * @returns {Promise<any[]>} Array of raw product objects.
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
