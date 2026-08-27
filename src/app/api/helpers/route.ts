import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { distanceInKm } from '@/lib/geo';

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
    const searchQuery = searchParams.get('q') || searchParams.get('search');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius_km') ?? '10';
    const categoryId = searchParams.get('category_id');
    const tingkat = searchParams.get('tingkat');

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
        id, bio, wilayah_domisili, radius_layanan_km, domisili_lat, domisili_lng, foto_wajah_url,
        is_available, rating_avg, total_tugas_selesai,
        tingkat_kepercayaan, verified_by_admin_fallback,
        users!inner ( id, full_name ),
        helper_service_categories (
          service_categories ( id, nama, estimasi_durasi_menit, harga_dasar, tingkat, is_high_risk, jarak_min_km, jarak_max_km )
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

    let filtered = (helpers ?? []).map((helper) => ({
      ...helper,
      jarak_km: lat !== null && lng !== null && helper.domisili_lat !== null && helper.domisili_lng !== null
        ? Number(distanceInKm(lat, lng, helper.domisili_lat, helper.domisili_lng).toFixed(2))
        : null,
    }));

    // Filter pencarian nama helper, nama jasa/layanan, atau bio jika parameter `q` / `search` diberikan
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((h) => {
        const matchName = h.users?.full_name?.toLowerCase().includes(q);
        const matchBio = h.bio?.toLowerCase().includes(q);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchService = (h.helper_service_categories as any[])?.some((c: any) =>
          c.service_categories?.nama?.toLowerCase().includes(q)
        );
        return Boolean(matchName || matchBio || matchService);
      });
    }

    if (lat !== null && lng !== null) filtered = filtered.filter((h) => h.jarak_km !== null && h.jarak_km <= Math.min(radiusKm, Number(h.radius_layanan_km)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (tingkat) filtered = filtered.filter((h) => (h.helper_service_categories as any[])?.some((c: any) => c.service_categories?.tingkat === tingkat));

    filtered = filtered.map((helper) => ({
      ...helper,
      foto_url: helper.foto_wajah_url ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      kategori: (helper.helper_service_categories as any[])?.map((item: any) => item.service_categories).filter(Boolean) ?? [],
    }));

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
