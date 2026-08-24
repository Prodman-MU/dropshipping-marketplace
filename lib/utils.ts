/**
 * @file utils.ts
 * @description General-Purpose Utilities, Class Name Merging & Domain Normalization.
 * 
 * Provides CSS class concatenation using clsx & tailwind-merge, localized currency/number formatting,
 * and resilient Shopify domain parsing algorithms that handle protocol variations, www prefixes,
 * subpaths, custom domain aliases, and .myshopify.com fallbacks.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple CSS class names and resolves Tailwind CSS conflicts.
 * 
 * @param inputs - Class names, boolean flags, or conditional class expressions.
 * @returns {string} Optimized class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric price into a localized currency string (e.g. ₹4,999.00 or $149.00).
 * 
 * @param {number} amount - Numeric monetary value.
 * @param {string} [currency="INR"] - Target ISO currency code.
 * @returns {string} Formatted currency representation.
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a number with comma separators (e.g. 1,000,000).
 * 
 * @param {number} num - Raw number.
 * @returns {string} Comma-separated string.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Extracts and cleanses a bare hostname/domain from arbitrary user URL inputs.
 * Strips protocols (http/https), authentication strings, port numbers, URL query parameters,
 * trailing slashes, and whitespace.
 * 
 * @example
 * cleanStoreDomain("https://apex-gear.myshopify.com/products/test?ref=123") // "apex-gear.myshopify.com"
 * cleanStoreDomain("pause2play.in/") // "pause2play.in"
 * 
 * @param {string} input - Raw store URL or domain string.
 * @returns {string} Clean lowercase domain hostname.
 */
export function cleanStoreDomain(input: string): string {
  if (!input) return "";
  
  // Clean surrounding quotes, spaces, and hidden Unicode whitespace characters
  let raw = String(input).trim().toLowerCase();
  raw = raw.replace(/^['"\s\u200B]+|['"\s\u200B]+$/g, "");
  
  if (!raw) return "";

  // Prepend protocol if missing so native URL parser can extract hostname safely
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  try {
    const parsed = new URL(raw);
    let hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
    // Remove port numbers if attached (e.g. :3000)
    if (hostname.includes(":")) {
      hostname = hostname.split(":")[0];
    }
    return hostname;
  } catch {
    // Fallback regex cleaning if native URL parser fails on malformed input
    let cleaned = raw.replace(/^https?:\/\//i, "");
    cleaned = cleaned.replace(/[\/\?#].*$/, "");
    cleaned = cleaned.replace(/[^a-z0-9\.\-]/g, "");
    return cleaned;
  }
}

/**
 * Generates an exhaustive set of domain variations/aliases for matching Shopify stores.
 * Handles both custom domains (e.g. pause2play.in) and default myshopify domains.
 * 
 * @example
 * getDomainCandidates("pause2play.in")
 * // returns ["pause2play.in", "www.pause2play.in", "pause2play.myshopify.com"]
 * 
 * @param {string} input - Raw domain input.
 * @returns {string[]} Array of candidate domain permutations.
 */
export function getDomainCandidates(input: string): string[] {
  let baseDomain = cleanStoreDomain(input);
  if (!baseDomain) return [];

  // If user entered a bare store handle/slug like 'apex-gear'
  if (!baseDomain.includes(".")) {
    baseDomain = `${baseDomain}.myshopify.com`;
  }

  const candidates = new Set<string>();
  candidates.add(baseDomain);

  // Toggle www. prefix candidate
  if (baseDomain.startsWith("www.")) {
    candidates.add(baseDomain.replace(/^www\./, ""));
  } else if (!baseDomain.endsWith(".myshopify.com")) {
    candidates.add(`www.${baseDomain}`);
  }

  // Add .myshopify.com fallback for custom branded domains
  if (!baseDomain.endsWith(".myshopify.com")) {
    const slug = baseDomain.replace(/^www\./, "").split(".")[0];
    if (slug && slug.length >= 2) {
      candidates.add(`${slug}.myshopify.com`);
    }
  }

  return Array.from(candidates);
}

/**
 * Compares two domain or URL inputs to determine if they refer to the same merchant store.
 * 
 * @param {string} input1 - First store URL/domain.
 * @param {string} input2 - Second store URL/domain.
 * @returns {boolean} True if domains share any candidate variation.
 */
export function isSameStoreDomain(input1: string, input2: string): boolean {
  const c1 = getDomainCandidates(input1);
  const c2 = getDomainCandidates(input2);
  if (c1.length === 0 || c2.length === 0) return false;

  return c1.some((d1) => c2.includes(d1));
}

/**
 * Normalizes user input into a fully qualified HTTPS URL.
 * 
 * @param {string} input - Domain or URL input.
 * @returns {string} Sanitized https:// URL string.
 */
export function normalizeStoreUrl(input: string): string {
  const domain = cleanStoreDomain(input);
  if (!domain) return "";
  return `https://${domain}`;
}

/**
 * Extracts a clean, human-readable brand slug from a store domain or name.
 * 
 * @example
 * getStoreSlug("www.pause2play.in") -> "pause2play"
 * getStoreSlug("apex-gear.myshopify.com") -> "apex-gear"
 * 
 * @param {string} input - Raw store domain, myshopify domain, or store name.
 * @returns {string} Clean URL-safe store brand slug.
 */
export function getStoreSlug(input: string): string {
  if (!input) return "store";
  let cleaned = cleanStoreDomain(input);
  if (!cleaned) {
    cleaned = input.toLowerCase().trim();
  }

  // Remove .myshopify.com
  cleaned = cleaned.replace(/\.myshopify\.com$/i, "");
  // Remove leading www.
  cleaned = cleaned.replace(/^www\./i, "");
  // Remove common TLD extensions (.in, .com, .co, .org, .net, .store, .shop, etc.)
  cleaned = cleaned.replace(/\.(in|com|co|org|net|store|shop|io|ai|biz|online)$/i, "");
  // Also handle country-code second-level TLDs like .co.in
  cleaned = cleaned.replace(/\.co$/i, "");

  // Sanitize to alphanumeric and hyphens
  cleaned = cleaned.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "store";
}

/**
 * Derives a clean URL-safe product handle from a listing.
 * 
 * @param {{ handle?: string; title: string; id: string }} product - Product listing.
 * @returns {string} Clean URL-safe product slug handle.
 */
export function getProductHandle(product: { handle?: string; title?: string; id?: string }): string {
  if (product.handle && product.handle.trim()) {
    return product.handle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  if (product.title && product.title.trim()) {
    return product.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  return product.id || "item";
}

/**
 * Generates the canonical store-namespaced product URL for marketplace navigation.
 * 
 * @example
 * getProductPageUrl(slot) -> "/product/pause2play/minecraft-blocks-46-pcs"
 * 
 * @param {{ handle?: string; title: string; id: string; merchant: { myshopifyDomain: string; name?: string } }} slot - Product listing slot.
 * @returns {string} Relative URL path to dedicated product page.
 */
export function getProductPageUrl(slot: {
  id: string;
  title: string;
  handle?: string;
  merchant: { myshopifyDomain: string; name?: string };
}): string {
  const storeSlug = getStoreSlug(slot.merchant.myshopifyDomain || slot.merchant.name || "store");
  const handle = getProductHandle(slot);
  return `/product/${storeSlug}/${handle}`;
}

