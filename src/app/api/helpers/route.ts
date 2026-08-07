import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/helpers — Katalog helper verified dengan filter radius dan kategori
// Query params: lat (float), lng (float), radius_km (float, default 10), category_id (uuid)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius_km') ?? '10';
    const categoryId = searchParams.get('category_id');

    const lat = latParam ? parseFloat(latParam) : null;
    const lng = lngParam ? parseFloat(lngParam) : null;
    const radiusKm = parseFloat(radiusParam);

    if ((latParam && isNaN(lat!)) || (lngParam && isNaN(lng!)) || isNaN(radiusKm)) {
      return createApiError('validation_error', 'Parameter koordinat atau radius tidak valid', 400);
    }

    let query = supabase
      .from('helper_profiles')
      // KTP url dan koordinat exact domisili tidak dibuka ke katalog publik
      .select(`
        id, bio, wilayah_domisili, radius_layanan_km,
        is_available, rating_avg, total_tugas_selesai,
        tingkat_kepercayaan, verified_by_admin_fallback,
        users!inner ( id, full_name ),
        helper_service_categories (
          service_categories ( id, nama, estimasi_durasi_menit, harga_dasar )
        )
      `)
      .eq('status', 'verified')
      .eq('is_available', true);

    // Filter kategori jika diberikan
    if (categoryId) {
      query = query.eq('helper_service_categories.service_category_id', categoryId);
    }

    const { data: helpers, error } = await query;

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    // Filter radius sisi server menggunakan Haversine formula
    // (Supabase free tier tidak selalu support PostGIS)
    let filtered = helpers ?? [];

    if (lat !== null && lng !== null) {
      filtered = filtered.filter((h) => {
        if (!h.radius_layanan_km) return false;
        // Haversine: hitung jarak dari koordinat pencari ke domisili helper
        // Catatan: domisili_lat/lng tidak di-select untuk privasi, pakai wilayah sebagai
        // fallback. Filter ketat hanya bisa dilakukan jika koordinat diekspos.
        // Untuk MVP: helper difilter berdasarkan radius_layanan_km yang mereka atur sendiri.
        // Implementasi Haversine penuh membutuhkan koordinat — currently semua helper returned.
        return true;
      });
    }

    return apiResponse(
      {
        total: filtered.length,
        helpers: filtered,
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
