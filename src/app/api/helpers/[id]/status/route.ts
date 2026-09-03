import { createApiError } from '@/lib/api-response';
import { PUT as approveHelper } from '../../../helper/[id]/approve/route';
import { PUT as rejectHelper } from '../../../helper/[id]/reject/route';
import { PATCH as suspendHelper } from '../../../admin/helpers/[id]/suspend/route';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.clone().json().catch(() => ({}));
  if (body.action === 'approve') return approveHelper(request, { params });
  if (body.action === 'reject') return rejectHelper(request, { params });
  if (body.action !== 'suspend') return createApiError('validation_error', 'action harus approve, reject, atau suspend', 422);

  const suspendRequest = new Request(request.url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision: 'suspend',
      reason: typeof body.alasan === 'string' && body.alasan.trim() ? body.alasan.trim() : 'Ditangguhkan oleh Admin',
    }),
  });

  return suspendHelper(suspendRequest, { params });
}
