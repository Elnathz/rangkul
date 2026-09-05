import { createClient, createAdminClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/koordinator/lansia — list lansia di wilayah Koordinator
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

    const role = userProfile?.role || user.user_metadata?.role;
    if (role !== 'koordinator' && role !== 'admin') {
      return createApiError('forbidden', 'Hanya Koordinator atau Admin yang dapat mengakses halaman ini', 403);
    }

    const admin = await createAdminClient();

    const query = admin
      .from('lansia_profiles')
      .select('*, keluarga:users!lansia_profiles_keluarga_id_fkey(full_name)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (role === 'koordinator') {
      const { data: kp } = await admin
        .from('koordinator_profiles')
        .select('wilayah')
        .eq('user_id', user.id)
        .maybeSingle();

      if (kp?.wilayah) {
        const { data: regionalProfiles } = await admin
          .from('lansia_profiles')
          .select('*, keluarga:users!lansia_profiles_keluarga_id_fkey(full_name)')
          .is('deleted_at', null)
          .ilike('kecamatan', `%${kp.wilayah}%`)
          .order('created_at', { ascending: false });

        if (regionalProfiles && regionalProfiles.length > 0) {
          const formatted = regionalProfiles.map((p: Record<string, unknown> & { keluarga?: { full_name?: string } }) => ({
            ...p,
            nama_keluarga: p.keluarga?.full_name || 'Keluarga Rangkul',
          }));
          return apiResponse({ profiles: formatted }, 200);
        }
      }
    }

    const { data: profiles, error } = await query;

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    const formatted = (profiles ?? []).map((p: Record<string, unknown> & { keluarga?: { full_name?: string } }) => ({
      ...p,
      nama_keluarga: p.keluarga?.full_name || 'Keluarga Rangkul',
    }));

    return apiResponse({ profiles: formatted }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

// PATCH /api/koordinator/lansia — verifikasi lansia oleh Koordinator
export async function PATCH(request: Request) {
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

    const role = userProfile?.role || user.user_metadata?.role;
    if (role !== 'koordinator' && role !== 'admin') {
      return createApiError('forbidden', 'Hanya Koordinator atau Admin yang dapat memverifikasi lansia', 403);
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || (status !== 'verified' && status !== 'rejected')) {
      return createApiError('validation_error', 'Parameter id dan status valid wajib diisi', 400);
    }

    const admin = await createAdminClient();
    const { data: updated, error: updateError } = await admin
      .from('lansia_profiles')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      return createApiError('server_error', 'Gagal memperbarui status verifikasi lansia', 500);
    }

    return apiResponse({ message: `Status verifikasi lansia berhasil diperbarui menjadi ${status}`, profile: updated }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
