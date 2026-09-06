import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { getSelectableServiceCategories, type ServiceCategoryRow } from '@/lib/service-category-tree';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);
    // Include inactive root rows only to resolve a child label. The shared
    // hierarchy helper removes parents from the selectable result, so every
    // consumer receives the same leaf-only catalog.
    const { data, error } = await supabase
      .from('service_categories')
      .select('id, nama, deskripsi, estimasi_durasi_menit, harga_dasar, is_high_risk, is_active, tingkat, jarak_min_km, jarak_max_km, parent_id')
      .or('is_active.eq.true,parent_id.is.null')
      .order('tingkat')
      .order('nama');
    if (error) return createApiError('server_error', error.message, 500);
    const categories = getSelectableServiceCategories((data ?? []) as ServiceCategoryRow[]);
    return apiResponse({ categories }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
