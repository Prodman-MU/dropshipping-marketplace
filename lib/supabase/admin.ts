/**
 * @file admin.ts
 * @description Privileged Supabase Admin Client for Server-Side & Background Workflows.
 * 
 * Uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass PostgreSQL Row-Level Security (RLS)
 * and perform administrative operations such as user management, storage bucket provisioning,
 * and Shopify webhook batch synchronization.
 * 
 * ⚠️ CAUTION: NEVER import or execute this module in client components or expose it to the browser.
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Creates and returns a privileged Supabase client with the Service Role key.
 * Disables session persistence and token refreshing since it operates server-side.
 * 
 * @returns SupabaseClient instance with service role privileges.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_service_role_key";

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
