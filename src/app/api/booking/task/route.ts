import { createClient } from '@/lib/supabase/server';
import { createTaskSchema } from '@/lib/validations/booking';
import { apiResponse, createApiError } from '@/lib/api-response';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createApiError('unauthorized', 'Anda harus login untuk mengakses resource ini', 401);
    }

    // Check user role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== 'keluarga') {
      return createApiError('forbidden', 'Hanya role keluarga yang dapat membuat task', 403);
    }

    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

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

    const { lansia_id, service_category_id, jadwal_waktu, catatan } = validation.data;

    // Fetch price from service_categories
    const { data: category } = await supabase
      .from('service_categories')
      .select('harga_dasar')
      .eq('id', service_category_id)
      .single();

    const harga_dasar = category?.harga_dasar ?? 50000;
    const harga_final = harga_dasar;

    // Insert task into Supabase tasks table
    const { data: task, error: insertError } = await supabase
      .from('tasks')
      .insert({
        keluarga_id: user.id,
        lansia_id,
        service_category_id,
        jadwal_waktu,
        catatan: catatan || null,
        status: 'diajukan',
        harga_dasar,
        harga_final,
      })
      .select('*')
      .single();

    if (insertError) {
      return createApiError('server_error', insertError.message, 500);
    }

    return apiResponse(
      {
        message: 'Task berhasil dibuat',
        task,
      },
      201
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
