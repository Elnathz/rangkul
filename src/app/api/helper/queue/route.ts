import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/helper/queue Koordinator melihat antrean Helper pending di wilayahnya
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
      .single();

    if (!userProfile || userProfile.role !== 'koordinator') {
      return createApiError('forbidden', 'Hanya koordinator yang dapat melihat antrean ini', 403);
    }

    // Ambil wilayah koordinator ini
    const { data: koordinatorProfile, error: koordError } = await supabase
      .from('koordinator_profiles')
      .select('id, wilayah, status')
      .eq('user_id', user.id)
      .single();

    if (koordError || !koordinatorProfile) {
      return createApiError('not_found', 'Profil koordinator tidak ditemukan', 404);
    }

    if (koordinatorProfile.status !== 'verified') {
      return createApiError('forbidden', 'Akun koordinator belum diverifikasi admin', 403);
    }

    // Ambil semua Helper pending yang wilayah domisilinya matching
    const { data: helpers, error: helperError } = await supabase
      .from('helper_profiles')
      .select(`
        id, wilayah_domisili, domisili_lat, domisili_lng,
        bio, radius_layanan_km, ktp_url, created_at,
        users!inner ( id, full_name, email, phone ),
        helper_service_categories (
          service_categories ( id, nama )
        )
      `)
      .eq('status', 'pending_verification')
      .ilike('wilayah_domisili', `%${koordinatorProfile.wilayah}%`);

    if (helperError) {
      return createApiError('server_error', helperError.message, 500);
    }

    return apiResponse(
      {
        koordinator_wilayah: koordinatorProfile.wilayah,
        total: helpers?.length ?? 0,
        helpers: helpers ?? [],
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
