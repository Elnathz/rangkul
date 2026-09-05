import { createAdminClient } from '@/lib/supabase/server';

export async function getSignedUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  // If it's already a full URL (e.g. from older dummy data), just return it
  if (path.startsWith('http')) return path;

  try {
    const adminSupabase = await createAdminClient();
    const { data, error } = await adminSupabase.storage
      .from('dokumen')
      .createSignedUrl(path, 3600);

    if (error || !data) {
      console.error("Error creating signed URL for", path, error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error("Exception in getSignedUrl", err);
    return null;
  }
}

export async function getSignedUrls(paths: (string | null)[]): Promise<(string | null)[]> {
  return Promise.all(paths.map(p => getSignedUrl(p)));
}
