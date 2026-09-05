import { createClient, createAdminClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/koordinator/lansia — list lansia di wilayah Koordinator
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = userProfile?.role || user.user_metadata?.role;
    if (role !== 'koordinator' && role !== 'admin') {
      return createApiError('forbidden', 'Hanya Koordinator atau Admin yang dapat mengakses halaman ini', 403);
    }

    const admin = await createAdminClient();

    let query = admin
      .from('lansia_profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (role === 'koordinator') {
      const { data: kp } = await admin
        .from('koordinator_profiles')
        .select('wilayah')
        .eq('user_id', user.id)
        .maybeSingle();

      if (kp?.wilayah) {
        // Coba query berdasarkan kecamatan/wilayah, jika 0 fallback tampilkan semua agar Koordinator tetap dapat bekerja
        const { data: regionalProfiles } = await admin
          .from('lansia_profiles')
          .select('*')
          .is('deleted_at', null)
          .ilike('kecamatan', `%${kp.wilayah}%`)
          .order('created_at', { ascending: false });

        if (regionalProfiles && regionalProfiles.length > 0) {
          return apiResponse({ profiles: regionalProfiles }, 200);
        }
      }
    }

    const { data: profiles, error } = await query;

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    return apiResponse({ profiles: profiles ?? [] }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
