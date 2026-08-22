import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/helper/profile — Helper melihat status profilnya sendiri
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { data: profile, error } = await supabase
      .from('helper_profiles')
      .select(`
        id, status, tingkat_kepercayaan, bio, wilayah_domisili,
        domisili_lat, domisili_lng, radius_layanan_km, is_available,
        rating_avg, total_tugas_selesai, suspend_reason,
        koordinator_id, created_at, updated_at,
        helper_service_categories (
          service_categories ( id, nama )
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    if (!profile) {
      return createApiError('not_found', 'Profil helper belum ada. Silakan daftar dulu via POST /api/helper/apply', 404);
    }

    return apiResponse({ profile }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
