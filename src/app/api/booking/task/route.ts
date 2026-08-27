// Force rebuild 2
import { createClient } from '@/lib/supabase/server';
import { createTaskSchema } from '@/lib/validations/booking';
import { apiResponse, createApiError } from '@/lib/api-response';
import { distanceInKm } from '@/lib/geo';

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
      console.log('BOOKING VALIDATION ERROR:', validation.error.flatten().fieldErrors);
      console.log('RECEIVED BODY:', body);
      return apiResponse(
        {
          error: 'validation_error',
          message: 'Data input tidak valid',
          fieldErrors: validation.error.flatten().fieldErrors,
        },
        400
      );
    }

    const { lansia_id, service_category_id, helper_id, jadwal_waktu, catatan, tambahan_waktu_menit } = validation.data;

    // Fetch category and its tingkat
    const { data: category, error: catError } = await supabase
      .from('service_categories')
      .select('harga_dasar, is_high_risk, is_active, jarak_min_km, jarak_max_km')
      .eq('id', service_category_id)
      .single();

    if (catError || !category) {
      return createApiError('not_found', 'Kategori layanan tidak ditemukan', 404);
    }
    
    if (!category.is_active) {
      return createApiError('validation_error', 'Kategori layanan tidak aktif atau merupakan parent category', 400);
    }

    const isDistanceBasedCategory = category.jarak_min_km !== null || category.jarak_max_km !== null;
    if (isDistanceBasedCategory && !helper_id) {
      return createApiError('validation_error', 'Pilih Helper agar jarak dan radius layanan dapat diverifikasi', 422);
    }

    let jarakKm: number | null = null;

    const { data: lansiaLocation } = await supabase
      .from('lansia_profiles')
      .select('lat, lng')
      .eq('id', lansia_id)
      .eq('keluarga_id', user.id)
      .single();

    // Enforce probation rule and distance bands if helper_id is provided (Direct Booking)
    if (helper_id) {
      const { data: helperData, error: helperError } = await supabase
        .from('helper_profiles')
        .select('tingkat_kepercayaan, status, domisili_lat, domisili_lng, radius_layanan_km')
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

      if (isDistanceBasedCategory) {
        if (!lansiaLocation || lansiaLocation.lat === null || lansiaLocation.lng === null || helperData.domisili_lat === null || helperData.domisili_lng === null) {
          return createApiError('validation_error', 'Koordinat Helper dan lansia wajib tersedia untuk layanan berbasis jarak', 422);
        }
        jarakKm = distanceInKm(Number(helperData.domisili_lat), Number(helperData.domisili_lng), Number(lansiaLocation.lat), Number(lansiaLocation.lng));
        if ((category.jarak_min_km !== null && jarakKm < Number(category.jarak_min_km)) || (category.jarak_max_km !== null && jarakKm > Number(category.jarak_max_km))) {
          return createApiError('validation_error', 'Jarak lokasi tidak sesuai dengan band jarak kategori layanan', 422);
        }
      }

      if (lansiaLocation && lansiaLocation.lat !== null && lansiaLocation.lng !== null && helperData.domisili_lat !== null && helperData.domisili_lng !== null) {
        jarakKm ??= distanceInKm(Number(helperData.domisili_lat), Number(helperData.domisili_lng), Number(lansiaLocation.lat), Number(lansiaLocation.lng));
        if (jarakKm > Number(helperData.radius_layanan_km)) return createApiError('validation_error', 'Lokasi lansia berada di luar radius layanan Helper', 422);
      }
    }

    const harga_dasar = category.harga_dasar;
    const extra_time_price = (tambahan_waktu_menit || 0) * 1000;
    const harga_final = harga_dasar + extra_time_price;

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
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      })
      .select('*')
      .single();

    if (insertError) {
      return createApiError('server_error', insertError.message, 500);
    }

    // If extra time is requested upfront, add it to task_extra_services
    if (tambahan_waktu_menit && tambahan_waktu_menit > 0) {
      await supabase.from('task_extra_services').insert({
        task_id: task.id,
        nama_layanan: `Tambahan Waktu (${tambahan_waktu_menit} Menit)`,
        biaya: extra_time_price,
        status: 'disetujui'
      });
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
