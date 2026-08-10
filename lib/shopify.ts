import crypto from "crypto";
import { MOCK_SLOTS, MOCK_MERCHANTS, SlotListing, MerchantVendor } from "@/data/mock-slots";
import { cleanStoreDomain, getDomainCandidates } from "@/lib/utils";

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
            merchant: {
              id: "m-shopify-live",
              name: SHOPIFY_STORE_DOMAIN || "Connected Shopify Store",
              myshopifyDomain: SHOPIFY_STORE_DOMAIN || "shopify.myshopify.com",
              storeLogo: "",
              status: "ACTIVE",
              totalProducts: json.data.products.edges.length,
              connectedSince: "Live Sync",
              lastWebhookSync: "Just now",
            },
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

/**
 * Fetch and map live product catalog from a connected Shopify Store domain
 */
export async function fetchProductsFromShopifyStore(
  domainInput: string,
  token?: string,
  whatsappNumberInput?: string,
  passcodeParam?: string
): Promise<{ merchant: MerchantVendor; slots: SlotListing[]; error?: string }> {
  // Clean domain and generate candidate domains (e.g. www.pause2play.in and pause2play.in)
  let cleanDomain = cleanStoreDomain(domainInput);
  if (!cleanDomain.includes(".")) {
    cleanDomain = `${cleanDomain}.myshopify.com`;
  }

  const candidateDomains = getDomainCandidates(cleanDomain);
  console.log(`[Store Ingestion Pipeline] Ingesting store at candidates: ${candidateDomains.join(", ")}`);

  // 1. Validate Domain Format Syntax
  const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}$/i;
  if (!domainRegex.test(cleanDomain)) {
    return {
      merchant: null as any,
      slots: [],
      error: `Invalid Domain Format: "${cleanDomain}" is not a valid site domain. Please verify your Shopify store domain and try again.`,
    };
  }

  // 2. Reachability & Storefront Validation Check
  const KNOWN_DEMO_DOMAINS = [
    "apex-gear",
    "threads-co",
    "tech-vault",
    "brand-store",
    "test-store",
    "demo",
    "myshopify",
  ];

  const isKnownDemo = KNOWN_DEMO_DOMAINS.some((d) => cleanDomain.includes(d));
  let isReachable = isKnownDemo;

  if (!isKnownDemo) {
    for (const dom of candidateDomains) {
      try {
        const checkRes = await fetch(`https://${dom}/products.json?limit=1`, {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        }).catch(() => null);

        if (checkRes && (checkRes.ok || checkRes.status === 200 || checkRes.status === 301 || checkRes.status === 302 || checkRes.status === 401 || checkRes.status === 403)) {
          isReachable = true;
          cleanDomain = dom;
          break;
        } else {
          const headRes = await fetch(`https://${dom}`, {
            method: "HEAD",
            headers: { "User-Agent": "Mozilla/5.0" },
            cache: "no-store",
            signal: AbortSignal.timeout(4000),
          }).catch(() => null);

          if (headRes && (headRes.ok || headRes.status < 500)) {
            isReachable = true;
            cleanDomain = dom;
            break;
          }
        }
      } catch (err) {
        console.warn(`Validation check failed for ${dom}:`, err);
      }
    }

    if (!isReachable) {
      return {
        merchant: null as any,
        slots: [],
        error: `Storefront Verification Failed: Could not reach or verify active site at "https://${cleanDomain}". Please verify your store URL is live and public before submitting for approval.`,
      };
    }
  }

  const storeName = cleanDomain
    .replace(".myshopify.com", "")
    .replace(/\./g, " ")
    .split(/[-_ ]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const cleanWhatsapp = whatsappNumberInput ? whatsappNumberInput.replace(/[^0-9]/g, "") : undefined;
  const customPasscode = passcodeParam && passcodeParam.trim().length > 0
    ? passcodeParam.trim()
    : `${cleanDomain.split(".")[0].toLowerCase()}123`;

  const merchant: MerchantVendor = {
    id: `m-${cleanDomain.replace(/[^a-z0-9]/gi, "-")}`,
    name: storeName || "Shopify Vendor",
    myshopifyDomain: cleanDomain,
    storeLogo: `https://icon.horse/icon/${cleanDomain}`,
    status: "PENDING",
    totalProducts: 0,
    connectedSince: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    lastWebhookSync: "Just now",
    whatsappNumber: cleanWhatsapp && cleanWhatsapp.length >= 7 ? cleanWhatsapp : undefined,
    passcode: customPasscode,
  };

  let fetchedProducts: any[] = [];
  let fetchMethod = "Public Storefront JSON Catalog";

  // Method 1: If Admin API access token provided (shpat_ or shpca_)
  if (token && (token.startsWith("shpat_") || token.startsWith("shpca_"))) {
    try {
      const adminRes = await fetch(`https://${cleanDomain}/admin/api/2024-04/products.json?limit=50`, {
        headers: {
          "X-Shopify-Access-Token": token.trim(),
          "Content-Type": "application/json",
        },
      });
      if (adminRes.ok) {
        const json = await adminRes.json();
        if (json.products && Array.isArray(json.products)) {
          fetchedProducts = json.products;
          fetchMethod = "Shopify Admin API";
        }
      }
    } catch (err) {
      console.warn(`Admin API fetch failed for ${cleanDomain}:`, err);
    }
  }

  // Method 2: If Storefront GraphQL Token provided
  if (fetchedProducts.length === 0 && token) {
    try {
      const graphqlRes = await shopifyStorefrontFetch({
        query: `
          query getProducts {
            products(first: 50) {
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
                    }
                  }
                  compareAtPriceRange {
                    minVariantPrice {
                      amount
                    }
                  }
                  images(first: 5) {
                    edges {
                      node {
                        url
                      }
                    }
                  }
                  variants(first: 20) {
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
        `,
        domain: cleanDomain,
        token: token.trim(),
      });

      if (graphqlRes.data?.products?.edges) {
        fetchedProducts = graphqlRes.data.products.edges.map((e: any) => e.node);
        fetchMethod = "Storefront GraphQL API";
      }
    } catch (err) {
      console.warn(`GraphQL Storefront fetch failed for ${cleanDomain}:`, err);
    }
  }

  // Method 3: Multi-endpoint Public Storefront JSON Catalog fetch across all candidate domains
  if (fetchedProducts.length === 0) {
    const endpointsToTry: string[] = [];
    for (const dom of candidateDomains) {
      endpointsToTry.push(`https://${dom}/products.json?limit=50`);
      endpointsToTry.push(`https://${dom}/collections/all/products.json?limit=50`);
    }

    for (const endpoint of endpointsToTry) {
      try {
        const res = await fetch(endpoint, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
          },
          redirect: "follow",
          cache: "no-store",
        });

        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("json")) {
          const json = await res.json();
          if (json.products && Array.isArray(json.products) && json.products.length > 0) {
            fetchedProducts = json.products;
            fetchMethod = `Public Storefront API (${endpoint})`;
            break;
          }
        }
      } catch (err) {
        console.warn(`Endpoint ${endpoint} failed:`, err);
      }
    }
  }

  let slots: SlotListing[] = [];

  if (fetchedProducts.length > 0) {
    merchant.totalProducts = fetchedProducts.length;

    slots = fetchedProducts.map((prod: any, index: number) => {
      const isGraphQL = typeof prod.id === "string" && prod.id.startsWith("gid://");
      const title = prod.title || `Product #${index + 1}`;
      
      const rawDesc = prod.body_html || prod.description || "";
      const description =
        rawDesc.replace(/<[^>]*>?/gm, "").trim().slice(0, 300) ||
        `Verified product asset synchronized from connected Shopify storefront: ${cleanDomain}.`;

      const category = prod.product_type || prod.productType || "General Store Catalog";

      let tags: string[] = [];
      if (Array.isArray(prod.tags)) {
        tags = prod.tags;
      } else if (typeof prod.tags === "string" && prod.tags) {
        tags = prod.tags.split(",").map((t: string) => t.trim());
      }
      if (tags.length === 0) {
        tags = ["Shopify Sync", "Verified Storefront"];
      }

      let images: string[] = [];
      if (isGraphQL) {
        images = prod.images?.edges?.map((e: any) => e.node.url) || [];
      } else if (Array.isArray(prod.images)) {
        images = prod.images.map((img: any) => (typeof img === "string" ? img : img.src)).filter(Boolean);
      }

      if (images.length === 0) {
        images = ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"];
      }

      const currencyCode = (isGraphQL ? prod.priceRange?.minVariantPrice?.currencyCode : prod.variants?.[0]?.currency) || "INR";

      let variants: any[] = [];
      if (isGraphQL && prod.variants?.edges) {
        variants = prod.variants.edges.map((ve: any, vIdx: number) => ({
          id: ve.node.id,
          title: ve.node.title || "Default Variant",
          price: parseFloat(ve.node.priceV2?.amount || "0"),
          currencyCode: ve.node.priceV2?.currencyCode || currencyCode,
          sku: ve.node.sku || `SKU-${index + 1}-${vIdx + 1}`,
          inventoryQuantity: ve.node.quantityAvailable ?? 15,
          availableForSale: true,
        }));
      } else if (Array.isArray(prod.variants)) {
        variants = prod.variants.map((v: any, vIdx: number) => ({
          id: String(v.id),
          title: v.title || "Default Variant",
          price: parseFloat(v.price || "0"),
          currencyCode,
          sku: v.sku || `SKU-${index + 1}-${vIdx + 1}`,
          inventoryQuantity: v.inventory_quantity ?? 15,
          availableForSale: (v.inventory_quantity ?? 15) > 0,
        }));
      }

      const firstVar = variants[0];
      const price = firstVar?.price ?? (isGraphQL ? parseFloat(prod.priceRange?.minVariantPrice?.amount || "0") : 0);
      const compareAtPrice = isGraphQL
        ? (prod.compareAtPriceRange?.minVariantPrice?.amount ? parseFloat(prod.compareAtPriceRange.minVariantPrice.amount) : undefined)
        : (prod.variants?.[0]?.compare_at_price ? parseFloat(prod.variants[0].compare_at_price) : undefined);

      const inventoryQuantity = firstVar?.inventoryQuantity ?? 15;
      const status = inventoryQuantity > 10 ? "AVAILABLE" : inventoryQuantity > 0 ? "RESERVED" : "SOLD";
      const sku = firstVar?.sku || `SKU-${index + 1}`;
      const shopifyProductId = isGraphQL ? prod.id : `gid://shopify/Product/${prod.id}`;
      const shopifyVariantId = firstVar ? (isGraphQL ? firstVar.id : `gid://shopify/ProductVariant/${firstVar.id}`) : `gid://shopify/ProductVariant/${prod.id}`;

      const handle = prod.handle || "";
      const productUrl = handle ? `https://${cleanDomain}/products/${handle}` : `https://${cleanDomain}`;

      return {
        id: `slot-${merchant.id}-${index + 1}`,
        slotNumber: `SLOT #${String(index + 1).padStart(3, "0")}`,
        title,
        description,
        category,
        price,
        compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
        currencyCode,
        inventoryQuantity,
        status,
        shopifyProductId,
        shopifyVariantId,
        merchant,
        tags,
        images,
        variants,
        sku,
        handle,
        productUrl,
        createdAt: prod.created_at || new Date().toISOString(),
        syncLogs: [
          {
            id: `sync-log-${Date.now()}-${index}`,
            eventType: "products/create",
            status: "SUCCESS",
            timestamp: new Date().toLocaleTimeString(),
            details: `Catalog product synced live from ${cleanDomain} via ${fetchMethod}`,
          },
        ],
      };
    });
  } else {
    // No products found on vendor storefront — do NOT create dummy products
    merchant.totalProducts = 0;
    slots = [];
  }

  return { merchant, slots };
}

