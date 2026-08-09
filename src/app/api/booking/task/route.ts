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

    const { lansia_id, service_category_id, helper_id, jadwal_waktu, catatan } = validation.data;

    // Fetch category and its tingkat
    const { data: category, error: catError } = await supabase
      .from('service_categories')
      .select('harga_dasar, is_high_risk, is_active')
      .eq('id', service_category_id)
      .single();

    if (catError || !category) {
      return createApiError('not_found', 'Kategori layanan tidak ditemukan', 404);
    }
    
    if (!category.is_active) {
      return createApiError('validation_error', 'Kategori layanan tidak aktif atau merupakan parent category', 400);
    }

    // Enforce probation rule if helper_id is provided (Direct Booking)
    if (helper_id) {
      const { data: helperData, error: helperError } = await supabase
        .from('helper_profiles')
        .select('tingkat_kepercayaan, status')
        .eq('id', helper_id)
        .single();
        
      if (helperError || !helperData) {
        return createApiError('not_found', 'Helper tidak ditemukan', 404);
      }
      
      if (helperData.status !== 'verified') {
         return createApiError('forbidden', 'Helper belum diverifikasi atau sedang di-suspend', 403);
      }

      if (helperData.tingkat_kepercayaan === 'probation' && category.is_high_risk) {
        return createApiError('forbidden', 'Helper probation tidak boleh mengambil tugas berisiko tinggi', 403);
      }
    }

    const harga_dasar = category.harga_dasar;
    const harga_final = harga_dasar;

    // Insert task into Supabase tasks table
    const { data: task, error: insertError } = await supabase
      .from('tasks')
      .insert({
        keluarga_id: user.id,
        lansia_id,
        helper_id: helper_id || null,
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
