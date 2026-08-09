import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { serviceCategorySchema } from '@/lib/validations/admin';

async function checkAdminAuth(supabase: any) {
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
    } catch (e: any) {
      if (e.message === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
      if (e.message === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);
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
    } catch (e: any) {
      if (e.message === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
      if (e.message === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);
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
    const { tingkat, parent_id, jarak_min_km, jarak_max_km, ...updateData } = validation.data;

    const { data, error } = await supabase
      .from('service_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return createApiError('server_error', 'Gagal memperbarui kategori: ' + error.message, 500);
    }

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
    } catch (e: any) {
      if (e.message === 'unauthorized') return createApiError('unauthorized', 'Anda harus login', 401);
      if (e.message === 'forbidden') return createApiError('forbidden', 'Akses ditolak', 403);
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

    return apiResponse({ data, message: 'Kategori berhasil dinonaktifkan (soft delete)' }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
