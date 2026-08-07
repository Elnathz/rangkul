import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/koordinator/profile — Koordinator melihat status profilnya sendiri
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
      .single();

    if (!userProfile || userProfile.role !== 'koordinator') {
      return createApiError('forbidden', 'Hanya koordinator yang dapat mengakses endpoint ini', 403);
    }

    const { data: profile, error } = await supabase
      .from('koordinator_profiles')
      .select(`
        id, wilayah, tingkat, status, saldo_komisi,
        diverifikasi_at, created_at, updated_at
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    if (!profile) {
      return createApiError(
        'not_found',
        'Profil koordinator belum ada. Daftar dulu via POST /api/koordinator/apply',
        404
      );
    }

    return apiResponse({ profile }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
