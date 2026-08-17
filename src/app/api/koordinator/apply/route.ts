import { createClient } from '@/lib/supabase/server';
import { koordinatorApplySchema } from '@/lib/validations/koordinator';
import { apiResponse, createApiError } from '@/lib/api-response';

// POST /api/koordinator/apply — Koordinator mendaftar untuk diverifikasi Admin
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

    if (!userProfile || userProfile.role !== 'koordinator') {
      return createApiError('forbidden', 'Hanya akun dengan role koordinator yang dapat mendaftar', 403);
    }

    // Cek apakah sudah ada profil koordinator
    const { data: existing } = await supabase
      .from('koordinator_profiles')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing && existing.status !== 'rejected') {
      return createApiError(
        'conflict',
        `Profil koordinator sudah ada dengan status: ${existing.status}`,
        409
      );
    }

    const body = await request.json();
    const validation = koordinatorApplySchema.safeParse(body);

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

    const { wilayah, tingkat, dokumen_url, ktp_url, foto_url, provinsi, kabupaten_kota, kecamatan, kelurahan, rt, rw } = validation.data;

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

    // Jika ada profil rejected sebelumnya, update — kalau belum ada, insert
    let profileId: string;

    if (existing && existing.status === 'rejected') {
      const { data: updated, error: updateError } = await supabase
        .from('koordinator_profiles')
        .update({
          wilayah,
          tingkat,
          dokumen_url,
          ktp_url: ktp_url || null,
          foto_url: foto_url || null,
          status: 'pending_verification',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (updateError || !updated) {
        return createApiError('server_error', updateError?.message ?? 'Gagal update profil', 500);
      }
      profileId = updated.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('koordinator_profiles')
        .insert({
          user_id: user.id,
          wilayah,
          tingkat,
          dokumen_url,
          ktp_url: ktp_url || null,
          foto_url: foto_url || null,
          status: 'pending_verification',
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        return createApiError('server_error', insertError?.message ?? 'Gagal menyimpan profil', 500);
      }
      profileId = inserted.id;
    }

    return apiResponse(
      {
        message: 'Pendaftaran koordinator berhasil. Menunggu verifikasi admin.',
        koordinator_profile_id: profileId,
      },
      201
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
