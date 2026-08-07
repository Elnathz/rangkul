import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

// GET /api/admin/koordinator/queue — Admin melihat semua Koordinator pending
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

    if (!userProfile || userProfile.role !== 'admin') {
      return createApiError('forbidden', 'Hanya admin yang dapat melihat antrean koordinator', 403);
    }

    const { data: koordinators, error } = await supabase
      .from('koordinator_profiles')
      .select(`
        id, wilayah, tingkat, dokumen_url, status, created_at,
        users!inner ( id, full_name, email, phone )
      `)
      .eq('status', 'pending_verification')
      .order('created_at', { ascending: true });

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    return apiResponse(
      {
        total: koordinators?.length ?? 0,
        koordinators: koordinators ?? [],
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
