import { apiResponse, createApiError } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/lansia — list semua lansia platform-wide untuk Admin
export async function GET() {
  try {
    await requireAdmin();

    const admin = await createAdminClient();
    const { data: profiles, error } = await admin
      .from('lansia_profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return createApiError('server_error', error.message, 500);
    }

    return apiResponse({ profiles: profiles ?? [] }, 200);
  } catch (error: unknown) {
    if ((error as { name?: string }).name === 'AdminAuthError') {
      const err = error as { code: string; message: string; status: number };
      return createApiError(err.code as 'unauthorized' | 'forbidden', err.message, err.status);
    }
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
