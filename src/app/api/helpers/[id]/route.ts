import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/helpers/[id] — Detail satu Helper verified
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { id } = await params;

    const { data: helper, error } = await supabase
      .from('helper_profiles')
      // KTP URL, koordinat exact, dan suspend_reason tidak diekspos di katalog
      .select(`
        id, bio, wilayah_domisili, radius_layanan_km,
        is_available, rating_avg, total_tugas_selesai,
        tingkat_kepercayaan, verified_by_admin_fallback,
        created_at,
        users!inner ( id, full_name ),
        helper_service_categories (
          service_categories ( id, nama, deskripsi, estimasi_durasi_menit, harga_dasar )
        )
      `)
      .eq('id', id)
      .eq('status', 'verified')
      .single();

    if (error || !helper) {
      return createApiError('not_found', 'Helper tidak ditemukan atau tidak tersedia', 404);
    }

    return apiResponse({ helper }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
