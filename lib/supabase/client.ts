/**
 * @file client.ts
 * @description Supabase Browser Client for Next.js 16 Client Components.
 * 
 * Uses `@supabase/ssr`'s `createBrowserClient` to initialize a client-side Supabase
 * instance. It automatically stores and reads session JWTs from browser cookies,
 * ensuring seamless synchronization between client components, server components,
 * and middleware.
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates and returns a Supabase client configured for browser / client-side execution.
 * Reads public environment variables with safe local development fallbacks.
 * 
 * @returns SupabaseClient instance configured with cookie auth storage.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
