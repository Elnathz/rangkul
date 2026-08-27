import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { serviceCategorySchema } from '@/lib/validations/admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { writeAuditLog } from '@/lib/audit';

type AppSupabaseClient = SupabaseClient<Database>;

async function checkAdminAuth(supabase: AppSupabaseClient) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('unauthorized');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!userData || userData.role !== 'admin') {
    throw new Error('forbidden');
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    try {
      await checkAdminAuth(supabase);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      if (message === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
      if (message === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return createApiError('not_found', 'Kategori tidak ditemukan', 404);
    }

    return apiResponse({ data }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    try {
      await checkAdminAuth(supabase);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      if (message === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
      if (message === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);
    }

    const body = await request.json();
    
    // Allow partial updates
    const partialSchema = serviceCategorySchema.partial();
    const validation = partialSchema.safeParse(body);

    if (!validation.success) {
      return apiResponse(
        {
          error: 'validation_error',
          message: 'Data input tidak valid',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { id } = await params;
    const updateData = {
      ...validation.data,
      ...(validation.data.parent_id !== undefined ? { parent_id: validation.data.parent_id } : {}),
      ...(validation.data.jarak_min_km !== undefined ? { jarak_min_km: validation.data.jarak_min_km } : {}),
      ...(validation.data.jarak_max_km !== undefined ? { jarak_max_km: validation.data.jarak_max_km } : {}),
    };

    const { data, error } = await supabase
      .from('service_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return createApiError('server_error', 'Gagal memperbarui kategori: ' + error.message, 500);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) await writeAuditLog({ actor_id: user.id, action: 'admin_service_category_updated', entity_type: 'service_category', entity_id: data.id, metadata: { fields: Object.keys(updateData) } });
    return apiResponse({ data, message: 'Kategori berhasil diperbarui' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    try {
      await checkAdminAuth(supabase);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '';
      if (message === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
      if (message === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);
    }

    const { id } = await params;

    // Soft delete
    const { data, error } = await supabase
      .from('service_categories')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return createApiError('server_error', 'Gagal menghapus kategori: ' + error.message, 500);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) await writeAuditLog({ actor_id: user.id, action: 'admin_service_category_deleted', entity_type: 'service_category', entity_id: data.id, metadata: { soft_delete: true } });
    return apiResponse({ data, message: 'Kategori berhasil dinonaktifkan (soft delete)' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
