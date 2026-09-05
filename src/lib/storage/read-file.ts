import { createAdminClient } from "@/lib/supabase/server";
import { canAccessPrivateFile } from "@/lib/storage/private-file-access";

export const PRIVATE_FILE_URL_EXPIRY_SECONDS = 300;

/**
 * Membuat signed URL pendek untuk object path privat setelah caller sudah
 * melewati pemeriksaan akses. Return null bila path tidak valid.
 */
export async function signFileUrl(path: string | null): Promise<string | null> {
  if (!path || path.startsWith("http")) return null;

  try {
    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase.storage
      .from("dokumen")
      .createSignedUrl(path, PRIVATE_FILE_URL_EXPIRY_SECONDS);

    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * Resolver untuk server component: memeriksa hak akses actor lalu menandatangani
 * path bila diizinkan. URL http lama (data dummy) dilewatkan apa adanya.
 * Return null bila tidak berhak atau file tidak dapat ditandatangani.
 */
export async function resolvePrivateFileUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const allowed = await canAccessPrivateFile(path);
  if (!allowed) return null;
  return signFileUrl(path);
}