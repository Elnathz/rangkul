import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);
    const { data, error } = await supabase.from('service_categories').select('id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, tingkat, jarak_min_km, jarak_max_km, parent_id').eq('is_active', true).order('tingkat').order('nama');
    if (error) return createApiError('server_error', error.message, 500);
    return apiResponse({ categories: data ?? [] }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
