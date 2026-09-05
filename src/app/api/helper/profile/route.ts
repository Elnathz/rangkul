import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { helperProfileUpdateSchema } from '@/lib/validations/helper';
import type { Database } from '@/types/database';

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

// PATCH /api/helper/profile - Helper memperbarui data operasional dan kategori layanan
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);

    const validation = helperProfileUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!validation.success) {
      return apiResponse({ error: 'validation_error', message: 'Data Helper tidak valid', fieldErrors: validation.error.flatten().fieldErrors }, 422);
    }

    const { data: existing, error: profileError } = await supabase
      .from('helper_profiles')
      .select('id, status, wilayah_domisili')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profileError) return createApiError('server_error', profileError.message, 500);
    if (!existing) return createApiError('not_found', 'Profil Helper belum ada', 404);

    const input = validation.data;
    if (input.kategori_ids) {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select('id')
        .in('id', input.kategori_ids)
        .eq('is_active', true);
      if (categoriesError) return createApiError('server_error', categoriesError.message, 500);
      if (!categories || categories.length !== new Set(input.kategori_ids).size) {
        return createApiError('validation_error', 'Satu atau lebih kategori tidak aktif atau tidak valid', 422);
      }
    }

    const wilayahChanged = input.wilayah_domisili !== undefined && input.wilayah_domisili !== existing.wilayah_domisili;
    const updates: Database['public']['Tables']['helper_profiles']['Update'] = {
      ...(input.bio !== undefined ? { bio: input.bio || null } : {}),
      ...(input.is_available !== undefined ? { is_available: input.is_available } : {}),
      ...(input.wilayah_domisili !== undefined ? { wilayah_domisili: input.wilayah_domisili } : {}),
      ...(input.domisili_lat !== undefined ? { domisili_lat: input.domisili_lat } : {}),
      ...(input.domisili_lng !== undefined ? { domisili_lng: input.domisili_lng } : {}),
      ...(input.radius_layanan_km !== undefined ? { radius_layanan_km: input.radius_layanan_km } : {}),
      ...(wilayahChanged ? { status: 'pending_verification', koordinator_id: null, verified_by_admin_fallback: false } : {}),
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabase
      .from('helper_profiles')
      .update(updates)
      .eq('id', existing.id)
      .select('id, status, wilayah_domisili, domisili_lat, domisili_lng, radius_layanan_km, is_available')
      .single();
    if (updateError) return createApiError('server_error', updateError.message, 500);

    if (input.kategori_ids) {
      const { error: deleteError } = await supabase.from('helper_service_categories').delete().eq('helper_id', existing.id);
      if (deleteError) return createApiError('server_error', deleteError.message, 500);
      const { error: insertError } = await supabase.from('helper_service_categories').insert(
        input.kategori_ids.map((service_category_id) => ({ helper_id: existing.id, service_category_id }))
      );
      if (insertError) return createApiError('server_error', insertError.message, 500);
    }

    return apiResponse({ message: wilayahChanged ? 'Profil diperbarui dan menunggu verifikasi ulang wilayah' : 'Profil Helper berhasil diperbarui', profile: updated }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
