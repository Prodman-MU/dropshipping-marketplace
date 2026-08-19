/**
 * @file storage.ts
 * @description Supabase Object Storage Utilities for Merchant Assets & Banners.
 * 
 * Provides client-side and server-side utilities for interacting with Supabase Storage buckets.
 * Manages uploading merchant logos, campaign banners, retrieving public CDN URLs, and ensuring
 * storage bucket provisioning with MIME type restrictions.
 */

import { createClient as createBrowserSupabase } from "./client";
import { createAdminClient } from "./admin";

/** Name of the public storage bucket for dropshipping assets */
export const MARKETPLACE_BUCKET = "marketplace-assets";

/**
 * Uploads a binary asset (e.g. merchant store logo, marketing banner) to Supabase Storage.
 * 
 * @param {File | Blob} file - The file or blob binary data to upload.
 * @param {string} path - Target storage path within the bucket (e.g. "logos/apex-gear.png").
 * @param {Object} [options] - Upload configuration options.
 * @param {boolean} [options.upsert=true] - Overwrite existing file at the same path.
 * @param {string} [options.contentType] - Explicit MIME type (e.g. "image/png").
 * @returns {Promise<{ publicUrl: string | null; error: Error | null }>} Public URL or error.
 */
export async function uploadMarketplaceAsset(
  file: File | Blob,
  path: string,
  options?: { upsert?: boolean; contentType?: string }
): Promise<{ publicUrl: string | null; error: Error | null }> {
  try {
    const supabase = createBrowserSupabase();

    const { data, error } = await supabase.storage
      .from(MARKETPLACE_BUCKET)
      .upload(path, file, {
        upsert: options?.upsert ?? true,
        contentType: options?.contentType,
      });

    if (error) {
      return { publicUrl: null, error };
    }

    const { data: urlData } = supabase.storage
      .from(MARKETPLACE_BUCKET)
      .getPublicUrl(data.path);

    return { publicUrl: urlData.publicUrl, error: null };
  } catch (err: unknown) {
    return { publicUrl: null, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Generates the permanent public CDN URL for an asset path in the marketplace storage bucket.
 * 
 * @param {string} path - Asset path inside the bucket.
 * @returns {string} Publicly accessible CDN URL.
 */
export function getAssetPublicUrl(path: string): string {
  const supabase = createBrowserSupabase();
  const { data } = supabase.storage.from(MARKETPLACE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Server-side initialization helper that checks if the public `marketplace-assets`
 * bucket exists and creates it with size/type restrictions if missing.
 */
export async function ensureMarketplaceBucket() {
  try {
    const admin = createAdminClient();
    const { data: buckets, error } = await admin.storage.listBuckets();
    if (error) throw error;

    const exists = buckets.some((b) => b.name === MARKETPLACE_BUCKET);
    if (!exists) {
      await admin.storage.createBucket(MARKETPLACE_BUCKET, {
        public: true,
        fileSizeLimit: 10485760, // 10MB file size limit
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/svg+xml",
          "image/gif",
        ],
      });
    }
  } catch (err) {
    console.warn("Storage bucket setup warning:", err);
  }
}
