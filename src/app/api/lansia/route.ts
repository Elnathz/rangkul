import { createClient, createAdminClient } from '@/lib/supabase/server';
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

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = userProfile?.role || user.user_metadata?.role || 'keluarga';

    if (role !== 'admin' && role !== 'koordinator' && role !== 'keluarga' && role !== 'helper') {
      return createApiError('forbidden', 'Role Anda tidak memiliki akses ke resource ini', 403);
    }

    // Gunakan admin client untuk admin & koordinator agar bypass RLS kebijakan privasi
    const dbClient = (role === 'admin' || role === 'koordinator') ? await createAdminClient() : supabase;

    let query = dbClient
      .from('lansia_profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (role === 'keluarga') {
      query = query.eq('keluarga_id', user.id);
    } else if (role === 'koordinator') {
      const { data: kp } = await supabase
        .from('koordinator_profiles')
        .select('wilayah')
        .eq('user_id', user.id)
        .maybeSingle();

      if (kp?.wilayah) {
        query = query.ilike('kecamatan', `%${kp.wilayah}%`);
      }
    }

    const { data: profiles, error } = await query;

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
      foto_url,
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
        foto_url: foto_url || null,
      } as unknown as Database['public']['Tables']['lansia_profiles']['Insert'])
      .select('*')
      .single();

    if (insertError) {
      return createApiError('server_error', insertError.message, 500);
    }

    // Cek apakah ada Koordinator di wilayah pendaftaran lansia
    if (kecamatan) {
      const { data: matchedKoordinators } = await supabase
        .from('koordinator_profiles')
        .select('user_id, id')
        .ilike('wilayah', `%${kecamatan}%`)
        .eq('status', 'verified');

      if (matchedKoordinators && matchedKoordinators.length > 0) {
        // Ada koordinator di wilayah ini -> kirimkan notifikasi ke Koordinator
        const notifInserts = matchedKoordinators.map((k) => ({
          user_id: k.user_id,
          title: 'Pengajuan Lansia Baru di Wilayah Anda',
          body: `Lansia baru bernama ${nama} di ${kelurahan ? 'Kel. ' + kelurahan : 'wilayah Anda'} membutuhkan verifikasi persetujuan.`,
          type: 'lansia_verification',
          is_read: false,
        }));
        await supabase.from('notifications').insert(notifInserts as unknown as Database['public']['Tables']['notifications']['Insert'][]);
      } else {
        // Belum ada koordinator di wilayah ini -> ditampung oleh Admin
        const { data: adminUsers } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin');

        if (adminUsers && adminUsers.length > 0) {
          const adminNotifs = adminUsers.map((a) => ({
            user_id: a.id,
            title: 'Penampungan Lansia (Wilayah Tanpa Koordinator)',
            body: `Lansia ${nama} didaftarkan di Kec. ${kecamatan} (Belum ada Koordinator). Membutuhkan peninjauan Admin.`,
            type: 'lansia_verification_admin',
            is_read: false,
          }));
          await supabase.from('notifications').insert(adminNotifs as unknown as Database['public']['Tables']['notifications']['Insert'][]);
        }
      }
    }

    return apiResponse({ message: 'Profil lansia berhasil ditambahkan dan diajukan untuk verifikasi', profile }, 201);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
