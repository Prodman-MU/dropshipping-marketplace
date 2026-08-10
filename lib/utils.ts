import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Clean URL or site link input to extract clean domain/hostname.
 * Handles protocols (http/https), auth credentials, ports, paths, query strings, and trailing slashes.
 */
export function cleanStoreDomain(input: string): string {
  if (!input) return "";
  
  // Clean surrounding quotes, spaces, and hidden characters
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
    // Remove port numbers if attached
    if (hostname.includes(":")) {
      hostname = hostname.split(":")[0];
    }
    return hostname;
  } catch (e) {
    // Fallback regex cleaning if URL parser fails
    let cleaned = raw.replace(/^https?:\/\//i, "");
    cleaned = cleaned.replace(/[\/\?#].*$/, "");
    cleaned = cleaned.replace(/[^a-z0-9\.\-]/g, "");
    return cleaned;
  }
}

/**
 * Generate exhaustive candidate domain variations for a given store input.
 * e.g., 'pause2play.in' -> ['pause2play.in', 'www.pause2play.in', 'pause2play.myshopify.com']
 */
export function getDomainCandidates(input: string): string[] {
  let baseDomain = cleanStoreDomain(input);
  if (!baseDomain) return [];

  // If user entered a simple store slug like 'apex-gear'
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

  // Add .myshopify.com fallback for custom domains
  if (!baseDomain.endsWith(".myshopify.com")) {
    const slug = baseDomain.replace(/^www\./, "").split(".")[0];
    if (slug && slug.length >= 2) {
      candidates.add(`${slug}.myshopify.com`);
    }
  }

  return Array.from(candidates);
}

/**
 * Checks if two store URL or domain inputs refer to the same merchant store.
 */
export function isSameStoreDomain(input1: string, input2: string): boolean {
  const c1 = getDomainCandidates(input1);
  const c2 = getDomainCandidates(input2);
  if (c1.length === 0 || c2.length === 0) return false;

  return c1.some((d1) => c2.includes(d1));
}

/**
 * Ensures https:// protocol is prepended if missing and returns clean store URL
 */
export function normalizeStoreUrl(input: string): string {
  const domain = cleanStoreDomain(input);
  if (!domain) return "";
  return `https://${domain}`;
}
