import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { serviceCategorySchema } from '@/lib/validations/admin';
import {
  setServiceCategoryInactive,
  ServiceCategoryError,
  updateServiceCategory,
} from '@/lib/admin/service-categories';
import { writeAuditLog } from '@/lib/audit';

type RouteContext = { params: Promise<{ id: string }> };

function serviceCategoryErrorResponse(error: unknown) {
  if (error instanceof ServiceCategoryError) {
    return createApiError(error.code, error.message, error.status);
  }
  return null;
}

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { user: null, reason: 'unauthorized' as const };
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();
  if (!userData || userData.role !== 'admin') return { user: null, reason: 'forbidden' as const };
  return { user, reason: 'ok' as const };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const supabase = await createClient();
    const { reason } = await assertAdmin(supabase);
    if (reason === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
    if (reason === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);

    const { id } = await params;
    const { data, error } = await supabase.from('service_categories').select('*').eq('id', id).maybeSingle();
    if (error) return createApiError('not_found', 'Kategori tidak ditemukan', 404);
    if (!data) return createApiError('not_found', 'Kategori tidak ditemukan', 404);

    return apiResponse({ data }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  return handleUpdate(request, params);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  return handleUpdate(request, params);
}

async function handleUpdate(request: Request, params: RouteContext['params']) {
  try {
    const supabase = await createClient();
    const { user, reason } = await assertAdmin(supabase);
    if (reason === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
    if (reason === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createApiError('validation_error', 'Data input tidak valid', 400);
    }

    const validation = serviceCategorySchema.partial().safeParse(body);
    if (!validation.success) {
      return apiResponse({
        error: 'validation_error',
        message: 'Data input tidak valid',
        fieldErrors: validation.error.flatten().fieldErrors,
      }, 422);
    }

    const { id } = await params;
    const data = await updateServiceCategory(supabase, id, validation.data);

    if (user) {
      await writeAuditLog({
        actor_id: user.id,
        action: 'admin_service_category_updated',
        entity_type: 'service_category',
        entity_id: data.id,
        metadata: { fields: Object.keys(validation.data) },
      });
    }
    return apiResponse({ data, message: 'Kategori berhasil diperbarui' }, 200);
  } catch (error: unknown) {
    return serviceCategoryErrorResponse(error) ?? createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const supabase = await createClient();
    const { user, reason } = await assertAdmin(supabase);
    if (reason === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
    if (reason === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);

    const { id } = await params;
    const data = await setServiceCategoryInactive(supabase, id);

    if (user) {
      await writeAuditLog({
        actor_id: user.id,
        action: 'admin_service_category_deleted',
        entity_type: 'service_category',
        entity_id: data.id,
        metadata: { soft_delete: true },
      });
    }
    return apiResponse({ data, message: 'Kategori berhasil dinonaktifkan (soft delete)' }, 200);
  } catch (error: unknown) {
    return serviceCategoryErrorResponse(error) ?? createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}