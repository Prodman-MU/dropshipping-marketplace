/**
 * @file middleware.ts (under lib/supabase/)
 * @description Session Refresh Helper for Next.js Root Middleware.
 * 
 * Intercepts incoming HTTP requests at the edge to refresh expiring Supabase Auth
 * session tokens in cookies. This prevents users from being abruptly logged out
 * while navigating Server Component routes in Next.js App Router.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Validates and refreshes the Supabase Auth session on incoming requests.
 * 
 * @param {NextRequest} request - Incoming Next.js HTTP request.
 * @returns {Promise<{ supabaseResponse: NextResponse, user: any }>}
 *          The updated Next.js response containing refreshed cookie headers and the current user object.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Calling getUser() validates the token against Supabase Auth servers
  // and writes refreshed cookies back to the response headers.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
