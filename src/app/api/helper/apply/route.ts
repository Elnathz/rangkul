import { createClient } from '@/lib/supabase/server';
import { helperProfileSchema } from '@/lib/validations/helper';
import { apiResponse, createApiError } from '@/lib/api-response';
import type { Database } from '@/types/database';

// POST /api/helper/apply — Helper mendaftar untuk verifikasi
export async function POST(request: Request) {
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

    if (!userProfile || userProfile.role !== 'helper') {
      return createApiError('forbidden', 'Hanya akun dengan role helper yang dapat mendaftar', 403);
    }

    // Cek apakah sudah ada profil helper (tidak boleh daftar ulang kecuali rejected)
    const { data: existing } = await supabase
      .from('helper_profiles')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing && existing.status !== 'suspended' && (existing.status as string) !== 'rejected') {
      return createApiError(
        'conflict',
        `Profil helper sudah ada dengan status: ${existing.status}`,
        409
      );
    }

    const body = await request.json();
    const validation = helperProfileSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse(
        {
          error: 'validation_error',
          message: 'Data input tidak valid',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { bio, wilayah_domisili, domisili_lat, domisili_lng, radius_layanan_km, ktp_url, foto_wajah_url, kategori_ids, provinsi, kabupaten_kota, kecamatan, kelurahan, rt, rw, koordinator_id } =
      validation.data;

    // Update tabel users untuk mengisi lokasi granular
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        provinsi,
        kabupaten_kota,
        kecamatan,
        kelurahan,
        rt,
        rw,
      })
      .eq('id', user.id);

    if (userUpdateError) {
      return createApiError('server_error', 'Gagal menyimpan detail lokasi wilayah', 500);
    }

    // Verifikasi semua kategori_ids valid di database
    const { data: validCategories, error: catError } = await supabase
      .from('service_categories')
      .select('id')
      .in('id', kategori_ids)
      .eq('is_active', true);

    if (catError || !validCategories || validCategories.length !== kategori_ids.length) {
      return createApiError('validation_error', 'Satu atau lebih kategori tidak valid', 400);
    }

    // Update atau Insert helper_profiles
    let profileId = existing?.id;
    let errorMsg = '';
    
    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('helper_profiles')
        .update({
          bio: bio || null,
          wilayah_domisili,
          domisili_lat,
          domisili_lng,
          radius_layanan_km,
          ktp_url,
          foto_wajah_url,
          koordinator_id: koordinator_id || null,
          status: 'pending_verification',
          suspend_reason: null, // Reset alasan penolakan
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select('id')
        .single();
        
      if (updateError) errorMsg = updateError.message;
      else profileId = updated.id;
      
      // Hapus kategori lama
      const { error: deleteError } = await supabase.from('helper_service_categories').delete().eq('helper_id', profileId as string);
      if (deleteError) errorMsg = deleteError.message;
    } else {
      const { data: profile, error: insertError } = await supabase
        .from('helper_profiles')
        .insert({
          user_id: user.id,
          bio: bio || null,
          wilayah_domisili,
          domisili_lat,
          domisili_lng,
          radius_layanan_km,
          ktp_url,
          foto_wajah_url,
          koordinator_id: koordinator_id || null,
          status: 'pending_verification',
          tingkat_kepercayaan: 'probation',
        } as unknown as Database['public']['Tables']['helper_profiles']['Insert'])
        .select('id')
        .single();
        
      if (insertError) errorMsg = insertError.message;
      else profileId = profile.id;
    }

    if (errorMsg || !profileId) {
      return createApiError('server_error', errorMsg || 'Gagal menyimpan profil', 500);
    }

    // Insert relasi kategori layanan
    const categoryInserts = kategori_ids.map((service_category_id) => ({
      helper_id: profileId,
      service_category_id,
    }));

    const { error: catInsertError } = await supabase
      .from('helper_service_categories')
      .insert(categoryInserts);

    if (catInsertError) {
      return createApiError('server_error', 'Gagal menyimpan kategori layanan', 500);
    }

    return apiResponse(
      {
        message: 'Pendaftaran helper berhasil. Menunggu verifikasi koordinator wilayah.',
        helper_profile_id: profileId,
      },
      201
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
