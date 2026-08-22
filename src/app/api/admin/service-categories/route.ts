import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { serviceCategorySchema } from '@/lib/validations/admin';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth & role (must be admin)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError || !userData || userData.role !== 'admin') {
      return createApiError('forbidden', 'Akses ditolak. Hanya untuk Admin.', 403);
    }

    // Fetch all categories
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('parent_id', { ascending: true, nullsFirst: true })
      .order('nama', { ascending: true });

    if (error) {
      return createApiError('server_error', 'Gagal mengambil data kategori: ' + error.message, 500);
    }

    return apiResponse({ data }, 200);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check auth & role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login', 401);
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return createApiError('forbidden', 'Akses ditolak. Hanya untuk Admin.', 403);
    }

    const body = await request.json();
    const validation = serviceCategorySchema.safeParse(body);

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

    const { tingkat, parent_id, jarak_min_km, jarak_max_km, ...insertData } = validation.data;
    
    // Insert new category
    const { data, error } = await supabase
      .from('service_categories')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return createApiError('server_error', 'Gagal menambahkan kategori: ' + error.message, 500);
    }

    return apiResponse({ data, message: 'Kategori berhasil ditambahkan' }, 201);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
