import { createClient } from '@/lib/supabase/server';
import { koordinatorActionSchema } from '@/lib/validations/koordinator';
import { apiResponse, createApiError } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit';

// PUT /api/admin/koordinator/[id]/approve — Admin approve Koordinator
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return createApiError('forbidden', 'Hanya admin yang dapat menyetujui koordinator', 403);
    }

    const { id: koordinatorId } = await params;

    const { data: koordProfile, error: koordError } = await supabase
      .from('koordinator_profiles')
      .select('id, status')
      .eq('id', koordinatorId)
      .single();

    if (koordError || !koordProfile) {
      return createApiError('not_found', 'Profil koordinator tidak ditemukan', 404);
    }

    if (koordProfile.status !== 'pending_verification') {
      return createApiError('conflict', `Koordinator sudah berstatus: ${koordProfile.status}`, 409);
    }

    const body = await request.json().catch(() => ({}));
    const validation = koordinatorActionSchema.safeParse(body);
    if (!validation.success) {
      return createApiError('validation_error', 'Data tidak valid', 400);
    }

    const { error: updateError } = await supabase
      .from('koordinator_profiles')
      .update({
        status: 'verified',
        diverifikasi_oleh: user.id,
        diverifikasi_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', koordinatorId);

    if (updateError) {
      return createApiError('server_error', updateError.message, 500);
    }

    await writeAuditLog({
      actor_id: user.id,
      action: 'koordinator_approved',
      entity_type: 'koordinator_profiles',
      entity_id: koordinatorId,
      metadata: { catatan: validation.data.catatan ?? null } as import('@/types/database').Json,
    });

    return apiResponse({ message: 'Koordinator berhasil disetujui.' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
