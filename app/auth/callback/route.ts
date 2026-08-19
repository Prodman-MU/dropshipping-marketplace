/**
 * @file route.ts (under app/auth/callback/)
 * @description Supabase Auth Code Exchange Callback Handler.
 * 
 * When a user signs in via OAuth (Google, GitHub), Magic Link, or Email Confirmation,
 * Supabase redirects back to this endpoint with a temporary one-time `code` query parameter.
 * This handler exchanges the code for a persistent session and writes encrypted HTTP cookies.
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles GET requests to /auth/callback.
 * Exchanges the auth code for a session and redirects to the requested landing page.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // If running locally, redirect to localhost origin
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // Handle proxy/reverse-proxy headers in cloud deployments (e.g. Vercel)
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If code exchange failed or expired, redirect back to homepage with error flag
  return NextResponse.redirect(`${origin}/?auth_error=invalid_code`);
}
