/**
 * @file server.ts
 * @description Supabase Server Client for Next.js 16 App Router (Server Components & Server Actions).
 * 
 * Uses `@supabase/ssr`'s `createServerClient` bound to Next.js 16's asynchronous `cookies()` API.
 * Enables server-side session validation and database/storage interactions directly within
 * React Server Components, Route Handlers, and Server Actions without exposing private credentials.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates and returns an authenticated Supabase client for server-side code.
 * Asynchronously accesses Next.js cookies to validate JWT auth tokens.
 * 
 * @returns {Promise<SupabaseClient>} Authenticated server-side Supabase client.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      /**
       * Retrieves all incoming request cookies
       */
      getAll() {
        return cookieStore.getAll();
      },
      /**
       * Sets refreshed cookies. Server Components cannot modify cookies directly,
       * so errors are safely caught; token refreshing is handled in middleware.ts.
       */
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be safely ignored as middleware.ts refreshes active user sessions.
        }
      },
    },
  });
}
