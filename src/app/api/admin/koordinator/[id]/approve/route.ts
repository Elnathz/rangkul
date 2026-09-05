import { createClient } from '@/lib/supabase/server';
import { koordinatorActionSchema } from '@/lib/validations/koordinator';
import { apiResponse, createApiError } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit';
import {
  KoordinatorReviewError,
  reviewKoordinatorStatus,
} from '@/lib/admin/koordinator-review';

function reviewErrorResponse(error: unknown) {
  if (error instanceof KoordinatorReviewError) {
    const message = error.status === 500 ? 'Gagal menyetujui koordinator' : error.message;
    return createApiError(error.code, message, error.status);
  }
  return null;
}

// PUT /api/admin/koordinator/[id]/approve — alias ke canonical review status
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

    const body = await request.json().catch(() => ({}));
    const validation = koordinatorActionSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse({
        error: 'validation_error',
        message: 'Data tidak valid',
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 422);
    }

    await reviewKoordinatorStatus(supabase, koordinatorId, user.id, {
      status: 'verified',
      catatan: validation.data.catatan,
    });

    await writeAuditLog({
      actor_id: user.id,
      action: 'koordinator_approved',
      entity_type: 'koordinator_profiles',
      entity_id: koordinatorId,
      metadata: { catatan: validation.data.catatan ?? null } as import('@/types/database').Json,
    });

    return apiResponse({ message: 'Koordinator berhasil disetujui.' }, 200);
  } catch (error: unknown) {
    return reviewErrorResponse(error) ?? createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}