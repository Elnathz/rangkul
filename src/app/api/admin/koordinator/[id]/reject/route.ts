import { createClient } from '@/lib/supabase/server';
import { koordinatorRejectSchema } from '@/lib/validations/koordinator';
import { apiResponse, createApiError } from '@/lib/api-response';
import { writeAuditLog } from '@/lib/audit';
import {
  KoordinatorReviewError,
  reviewKoordinatorStatus,
} from '@/lib/admin/koordinator-review';

function reviewErrorResponse(error: unknown) {
  if (error instanceof KoordinatorReviewError) {
    const message = error.status === 500 ? 'Gagal menolak koordinator' : error.message;
    return createApiError(error.code, message, error.status);
  }
  return null;
}

// PUT /api/admin/koordinator/[id]/reject — alias ke canonical review status
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
      return createApiError('forbidden', 'Hanya admin yang dapat menolak koordinator', 403);
    }

    const { id: koordinatorId } = await params;

    const body = await request.json().catch(() => ({}));
    const validation = koordinatorRejectSchema.safeParse(body);

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

    await reviewKoordinatorStatus(supabase, koordinatorId, user.id, {
      status: 'rejected',
      alasan: validation.data.alasan,
    });

    await writeAuditLog({
      actor_id: user.id,
      action: 'koordinator_rejected',
      entity_type: 'koordinator_profiles',
      entity_id: koordinatorId,
      metadata: {
        alasan: validation.data.alasan,
        foto_url: validation.data.foto_url ?? null,
      } as import('@/types/database').Json,
    });

    return apiResponse({ message: 'Koordinator berhasil ditolak. Dapat mengajukan ulang.' }, 200);
  } catch (error: unknown) {
    return reviewErrorResponse(error) ?? createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}