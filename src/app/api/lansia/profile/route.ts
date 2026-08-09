import { createClient } from '@/lib/supabase/server';
import { lansiaProfileSchema } from '@/lib/validations/lansia';
import { apiResponse, createApiError } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login untuk mengakses resource ini', 401);
    }

    // Check user role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'keluarga') {
      return createApiError('forbidden', 'Hanya role keluarga yang dapat membuat profil lansia', 403);
    }

    const body = await request.json();
    const validation = lansiaProfileSchema.safeParse(body);

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

    const {
      nama,
      alamat,
      lat,
      lng,
      catatan_kondisi,
      dokumen_identitas_lansia_url,
      dokumen_hubungan_keluarga_url,
      foto_url,
      hubungan_keluarga,
      provinsi,
      kabupaten_kota,
      kecamatan,
      kelurahan,
      rt,
      rw,
    } = validation.data;

    // Create Lansia Profile record in Supabase
    const { data: profile, error: insertError } = await supabase
      .from('lansia_profiles')
      .insert({
        keluarga_id: user.id,
        nama,
        alamat,
        lat: lat ?? null,
        lng: lng ?? null,
        catatan_kondisi: catatan_kondisi || null,
        dokumen_identitas_lansia_url: dokumen_identitas_lansia_url || null,
        dokumen_hubungan_keluarga_url: dokumen_hubungan_keluarga_url || null,
        foto_url: foto_url || null,
        hubungan_keluarga,
        provinsi,
        kabupaten_kota,
        kecamatan,
        kelurahan,
        rt,
        rw,
      })
      .select('*')
      .single();

    if (insertError) {
      return createApiError('server_error', insertError.message, 500);
    }

    return apiResponse(
      {
        message: 'Profil lansia berhasil disimpan',
        profile,
      },
      201
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
