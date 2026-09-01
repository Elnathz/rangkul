import { createClient } from '@/lib/supabase/server';
import { koordinatorStatusSchema } from '@/lib/validations/koordinator';
import { apiResponse, createApiError } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit';
import {
  KoordinatorReviewError,
  reviewKoordinatorStatus,
} from '@/lib/admin/koordinator-review';

function reviewErrorResponse(error: unknown) {
  if (error instanceof KoordinatorReviewError) {
    const message = error.status === 500 ? 'Gagal memperbarui status koordinator' : error.message;
    return createApiError(error.code, message, error.status);
  }
  return null;
}

// PATCH /api/admin/koordinator/[id]/status — canonical Admin review Koordinator
export async function PATCH(
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
      return createApiError('forbidden', 'Hanya admin yang dapat mereview koordinator', 403);
    }

    const { id: koordinatorId } = await params;

    const body = await request.json().catch(() => ({}));
    const validation = koordinatorStatusSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse(
        {
          error: 'validation_error',
          message: 'Data input tidak valid',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        422
      );
    }

    const { status, alasan, catatan } = validation.data;

    await reviewKoordinatorStatus(supabase, koordinatorId, user.id, { status, alasan, catatan });

    await writeAuditLog({
      actor_id: user.id,
      action: status === 'verified' ? 'koordinator_approved' : 'koordinator_rejected',
      entity_type: 'koordinator_profiles',
      entity_id: koordinatorId,
      metadata: {
        status,
        alasan: alasan ?? null,
        catatan: catatan ?? null,
      } as import('@/types/database').Json,
    });

    return apiResponse({
      message: status === 'verified'
        ? 'Koordinator berhasil disetujui.'
        : 'Koordinator berhasil ditolak. Dapat mengajukan ulang.',
    }, 200);
  } catch (error: unknown) {
    return reviewErrorResponse(error) ?? createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}