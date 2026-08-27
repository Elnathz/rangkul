import { createClient } from '@/lib/supabase/server';
import { apiResponse, createApiError } from '@/lib/api-response';
import { serviceCategorySchema } from '@/lib/validations/admin';
import { writeAuditLog } from '@/lib/audit';

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

    // Insert new category
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        nama: validation.data.nama,
        deskripsi: validation.data.deskripsi,
        estimasi_durasi_menit: validation.data.estimasi_durasi_menit,
        harga_dasar: validation.data.harga_dasar,
        is_high_risk: validation.data.is_high_risk,
        is_active: validation.data.is_active,
        tingkat: validation.data.tingkat,
        parent_id: validation.data.parent_id ?? null,
        jarak_min_km: validation.data.jarak_min_km ?? null,
        jarak_max_km: validation.data.jarak_max_km ?? null,
      })
      .select()
      .single();

    if (error) {
      return createApiError('server_error', 'Gagal menambahkan kategori: ' + error.message, 500);
    }

    const { data: { user: actor } } = await supabase.auth.getUser();
    if (actor) await writeAuditLog({ actor_id: actor.id, action: 'admin_service_category_created', entity_type: 'service_category', entity_id: data.id, metadata: { nama: data.nama } });
    return apiResponse({ data, message: 'Kategori berhasil ditambahkan' }, 201);
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
