/**
 * @file middleware.ts
 * @description Root Next.js Edge Middleware for Supabase Auth Session Management.
 * 
 * Intercepts incoming requests before they reach Server Components or Route Handlers.
 * Refreshes expiring Supabase Auth session tokens in secure HttpOnly cookies,
 * ensuring users remain authenticated without flashes or redirect loops.
 */

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Edge Middleware Handler.
 * Invokes updateSession() to refresh cookie credentials.
 * 
 * @param {NextRequest} request - Incoming HTTP request.
 * @returns {Promise<NextResponse>} Response containing updated cookie headers.
 */
export async function middleware(request: NextRequest) {
  const { supabaseResponse } = await updateSession(request);
  return supabaseResponse;
}

/**
 * Route Matcher Configuration.
 * Applies session refresh to all application routes while bypassing static assets,
 * image optimization endpoints, and common image extensions.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (browser icon)
     * - Static asset file extensions (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
