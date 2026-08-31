import { createClient } from '@/lib/supabase/server';

/**
 * Checks if the current user has access to view a specific private file.
 * Following Sprint 4 Task 1 rules:
 * - Admin can view all documents
 * - Koordinator can view documents of helpers/users in their region
 * - Users can view their own documents
 */
export async function canAccessPrivateFile(filePath: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) return false;

  const role = user.user_metadata?.role;
  
  // 1. Admin always has access
  if (role === 'admin') return true;

  // 2. Owner of the file always has access
  // The filePath is expected to be in format: `[user_id]/[doc_type]/[filename]`
  const pathParts = filePath.split('/');
  const fileOwnerId = pathParts[0];
  
  if (user.id === fileOwnerId) return true;

  // 3. Koordinator access (needs to check if the file owner is in their territory)
  if (role === 'koordinator') {
    // Basic verification: Check if the Koordinator is verified
    const { data: koordProfile } = await supabase
      .from('koordinator_profiles')
      .select('id, wilayah, status')
      .eq('user_id', user.id)
      .eq('status', 'verified')
      .maybeSingle();

    if (!koordProfile) return false;

    // Check if the file owner is a helper under this koordinator
    const { data: targetHelper } = await supabase
      .from('helper_profiles')
      .select('id, koordinator_id, wilayah_domisili')
      .eq('user_id', fileOwnerId)
      .maybeSingle();

    if (targetHelper) {
      if (targetHelper.koordinator_id === koordProfile.id || targetHelper.wilayah_domisili === koordProfile.wilayah) {
        return true;
      }
    }

    // Check if the file owner is another koordinator in the same wilayah
    const { data: targetKoord } = await supabase
      .from('koordinator_profiles')
      .select('id, wilayah')
      .eq('user_id', fileOwnerId)
      .maybeSingle();
      
    if (targetKoord && targetKoord.wilayah === koordProfile.wilayah) {
      return true;
    }
  }

  return false;
}
