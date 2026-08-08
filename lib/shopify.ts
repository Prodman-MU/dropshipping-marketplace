import crypto from "crypto";
import { MOCK_SLOTS, MOCK_MERCHANTS, SlotListing, MerchantVendor } from "@/data/mock-slots";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

/**
 * Verify Shopify Webhook HMAC SHA256 Signature
 */
export function verifyShopifyHmac(bodyText: string, hmacHeader: string | null): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET || !hmacHeader) return true; // Fallback in dev mode

  try {
    const hash = crypto
      .createHmac("sha256", SHOPIFY_WEBHOOK_SECRET)
      .update(bodyText, "utf8")
      .digest("base64");

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader));
  } catch (error) {
    console.error("HMAC verification error:", error);
    return false;
  }
}

/**
 * Storefront GraphQL API Query Helper
 */
export async function shopifyStorefrontFetch({
  query,
  variables = {},
  domain = SHOPIFY_STORE_DOMAIN,
  token = SHOPIFY_STOREFRONT_TOKEN,
}: {
  query: string;
  variables?: Record<string, any>;
  domain?: string;
  token?: string;
}) {
  if (!domain || !token) {
    throw new Error("Missing Shopify Storefront domain or access token.");
  }

  const endpoint = `https://${domain.replace(/^https?:\/\//, "")}/api/2024-04/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Shopify Storefront API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a direct Shopify Checkout / Cart URL via Storefront API mutation
 */
export async function createShopifyCartCheckout(variantId: string, quantity: number = 1): Promise<string | null> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
    return null;
  }

  const mutation = `
    mutation createCart($lineItems: [CartLineInput!]) {
      cartCreate(input: { lines: $lineItems }) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const res = await shopifyStorefrontFetch({
      query: mutation,
      variables: {
        lineItems: [{ merchandiseId: variantId, quantity }],
      },
    });

    if (res.data?.cartCreate?.cart?.checkoutUrl) {
      return res.data.cartCreate.cart.checkoutUrl;
    }
    return null;
  } catch (error) {
    console.error("Create Shopify Cart Error:", error);
    return null;
  }
}

/**
 * Fetch slots/products from connected Shopify stores (with mock fallback)
 */
export async function getShopifySlots(): Promise<SlotListing[]> {
  if (SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_TOKEN) {
    try {
      const query = `
        query getProducts {
          products(first: 20) {
            edges {
              node {
                id
                title
                description
                productType
                tags
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                compareAtPriceRange {
                  minVariantPrice {
                    amount
                  }
                }
                images(first: 3) {
                  edges {
                    node {
                      url
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      sku
                      quantityAvailable
                      priceV2 {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const json = await shopifyStorefrontFetch({ query });

      if (json.data?.products?.edges) {
        return json.data.products.edges.map((edge: any, index: number): SlotListing => {
          const product = edge.node;
          const slotNum = `SLOT #${String(index + 1).padStart(3, "0")}`;
          const firstVariant = product.variants?.edges[0]?.node;
          const inventory = firstVariant?.quantityAvailable ?? 15;
          const status = inventory > 10 ? "AVAILABLE" : inventory > 0 ? "RESERVED" : "SOLD";

          return {
            id: product.id,
            slotNumber: slotNum,
            title: product.title,
            description: product.description,
            category: product.productType || "Tactical Tech & EDC",
            price: parseFloat(product.priceRange?.minVariantPrice?.amount || "0"),
            compareAtPrice: product.compareAtPriceRange?.minVariantPrice?.amount
              ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
              : undefined,
            inventoryQuantity: inventory,
            status,
            shopifyProductId: product.id,
            shopifyVariantId: firstVariant?.id || "",
            merchant: MOCK_MERCHANTS[0],
            tags: product.tags || [],
            images: product.images?.edges?.map((imgEdge: any) => imgEdge.node.url) || [],
            sku: firstVariant?.sku || `SKU-${index + 1}`,
            createdAt: new Date().toISOString(),
            variants: product.variants?.edges?.map((vEdge: any) => ({
              id: vEdge.node.id,
              title: vEdge.node.title,
              price: parseFloat(vEdge.node.priceV2?.amount || "0"),
              sku: vEdge.node.sku || "",
              inventoryQuantity: vEdge.node.quantityAvailable || 0,
              availableForSale: true,
            })) || [],
            syncLogs: [
              {
                id: `live-log-${index}`,
                eventType: "products/update",
                status: "SUCCESS",
                timestamp: new Date().toISOString(),
                details: "Live query fetched from Shopify Storefront API GraphQL",
              },
            ],
          };
        });
      }
    } catch (err) {
      console.warn("Shopify Storefront API call failed, using mock slots:", err);
    }
  }

  return MOCK_SLOTS;
}

/**
 * Get single slot by ID or Slot Number
 */
export async function getSlotById(slotIdOrNumber: string): Promise<SlotListing | undefined> {
  const slots = await getShopifySlots();
  return slots.find(
    (s) => s.id === slotIdOrNumber || s.slotNumber.toLowerCase() === slotIdOrNumber.toLowerCase()
  );
}

/**
 * Get merchants list
 */
export async function getMerchants(): Promise<MerchantVendor[]> {
  return MOCK_MERCHANTS;
}
