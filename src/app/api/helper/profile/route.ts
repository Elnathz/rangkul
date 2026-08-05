import { createClient } from '@/lib/supabase/server';
import { helperProfileSchema } from '@/lib/validations/helper';
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

    if (profileError || !userProfile || userProfile.role !== 'helper') {
      return createApiError('forbidden', 'Hanya role helper yang dapat membuat profil helper', 403);
    }

    const body = await request.json();
    const validation = helperProfileSchema.safeParse(body);

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

    const { bio, wilayah_domisili, domisili_lat, domisili_lng, radius_layanan_km, ktp_url } = validation.data;

    // Upsert helper profile record in Supabase
    const { data: profile, error: upsertError } = await supabase
      .from('helper_profiles')
      .upsert(
        {
          user_id: user.id,
          bio: bio || null,
          wilayah_domisili,
          domisili_lat,
          domisili_lng,
          radius_layanan_km,
          ktp_url,
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (upsertError) {
      return createApiError('server_error', upsertError.message, 500);
    }

    return apiResponse(
      {
        message: 'Profil helper berhasil disimpan',
        profile,
      },
      200
    );
  } catch (error: unknown) {
    return createApiError('server_error', (error as Error).message || 'Terjadi kesalahan server', 500);
  }
}
