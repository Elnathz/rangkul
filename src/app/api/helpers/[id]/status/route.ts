import { createClient, createAdminClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { PUT as approveHelper } from '../../../helper/[id]/approve/route';
import { PUT as rejectHelper } from '../../../helper/[id]/reject/route';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.clone().json().catch(() => ({}));
  if (body.action === 'approve') return approveHelper(request, { params });
  if (body.action === 'reject') return rejectHelper(request, { params });
  if (body.action !== 'suspend') return createApiError('validation_error', 'action harus approve, reject, atau suspend', 422);

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return createApiError('forbidden', 'Hanya Admin yang dapat menangguhkan Helper', 403);
    const { id } = await params;
    const admin = await createAdminClient();
    const { data, error } = await admin.from('helper_profiles').update({ status: 'suspended', suspend_reason: typeof body.alasan === 'string' ? body.alasan : 'Ditangguhkan oleh Admin', updated_at: new Date().toISOString() }).eq('id', id).eq('status', 'verified').select('id, status').maybeSingle();
    if (error) return createApiError('server_error', error.message, 500);
    if (!data) return createApiError('conflict', 'Helper tidak ditemukan atau statusnya sudah berubah', 409);
    return apiResponse({ message: 'Helper berhasil ditangguhkan', helper: data }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
