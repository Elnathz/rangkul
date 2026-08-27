import { createClient, createAdminClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return createApiError('unauthorized', 'Anda harus login', 401);
    const body = await request.json().catch(() => ({}));
    if (typeof body.request_id !== 'string') return createApiError('validation_error', 'request_id wajib diisi', 422);

    const { data: koordinator } = await supabase.from('koordinator_profiles').select('id, status').eq('user_id', user.id).single();
    if (!koordinator || koordinator.status !== 'verified') return createApiError('forbidden', 'Hanya Koordinator terverifikasi yang dapat menyetujui foto', 403);
    const { data: photoRequest, error: requestError } = await supabase.from('helper_photo_change_requests').select('id, helper_id, foto_wajah_url, status, helper_profiles!inner ( koordinator_id )').eq('id', body.request_id).single();
    if (requestError || !photoRequest) return createApiError('not_found', 'Pengajuan foto tidak ditemukan', 404);
    const helperRelation = Array.isArray(photoRequest.helper_profiles) ? photoRequest.helper_profiles[0] : photoRequest.helper_profiles;
    if (!helperRelation || helperRelation.koordinator_id !== koordinator.id) return createApiError('forbidden', 'Pengajuan foto berada di luar wilayah Koordinator ini', 403);

    const admin = await createAdminClient();
    const { data: claimed, error: claimError } = await admin.from('helper_photo_change_requests').update({ status: 'approved', ditinjau_at: new Date().toISOString(), ditinjau_oleh: user.id }).eq('id', body.request_id).eq('status', 'pending').select('id, helper_id, foto_wajah_url').maybeSingle();
    if (claimError) return createApiError('server_error', claimError.message, 500);
    if (!claimed) return createApiError('conflict', 'Pengajuan foto sudah diproses Koordinator lain', 409);
    const { error: helperError } = await admin.from('helper_profiles').update({ foto_wajah_url: claimed.foto_wajah_url, updated_at: new Date().toISOString() }).eq('id', claimed.helper_id);
    if (helperError) return createApiError('server_error', helperError.message, 500);
    return apiResponse({ message: 'Foto Helper berhasil diverifikasi', request: claimed }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', error instanceof Error ? error.message : 'Terjadi kesalahan server', 500);
  }
}
