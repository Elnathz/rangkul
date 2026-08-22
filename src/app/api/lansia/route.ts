import { createClient } from '@/lib/supabase/server';
import { lansiaProfileSchema } from '@/lib/validations/lansia';
import { apiResponse, createApiError } from '@/lib/api-response';
import type { Database } from '@/types/database';

// GET /api/lansia — list semua lansia milik keluarga yang login
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { data: profiles, error } = await supabase
      .from('lansia_profiles')
      .select('id, nama, alamat, lat, lng, catatan_kondisi, created_at, updated_at')
      .eq('keluarga_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    return apiResponse({ profiles }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

// POST /api/lansia — tambah profil lansia baru
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

    if (!userProfile || userProfile.role !== 'keluarga') {
      return createApiError('forbidden', 'Hanya keluarga yang dapat menambah profil lansia', 403);
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
      provinsi,
      kabupaten_kota,
      kecamatan,
      kelurahan,
      rt,
      rw,
    } = validation.data;

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
        provinsi,
        kabupaten_kota,
        kecamatan,
        kelurahan,
        rt,
        rw,
      } as unknown as Database['public']['Tables']['lansia_profiles']['Insert'])
      .select('*')
      .single();

    if (insertError) {
      return createApiError('server_error', insertError.message, 500);
    }

    return apiResponse({ message: 'Profil lansia berhasil ditambahkan', profile }, 201);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
